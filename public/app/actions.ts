"use server"

import fs from "fs/promises"
import path from "path"

// Function to save signup data locally and attempt to send to webhook
export async function saveSignup(name: string, email: string) {
  console.log("Starting signup process for:", { name, email })

  try {
    // Save locally (this will always work regardless of webhook status)
    const dataDir = path.join(process.cwd(), "data")
    try {
      await fs.mkdir(dataDir, { recursive: true })
      console.log("Data directory created or already exists:", dataDir)
    } catch (error) {
      console.error("Error creating data directory:", error)
      // Continue anyway - directory might already exist
    }

    const filePath = path.join(dataDir, "signups.json")
    console.log("Saving to file path:", filePath)

    // Read existing data
    let signups = []
    try {
      const data = await fs.readFile(filePath, "utf8")
      signups = JSON.parse(data)
      console.log(`Found ${signups.length} existing signups`)
    } catch (error) {
      console.log("No existing signups file found, creating new one")
      // File might not exist yet
    }

    // Add new signup with timestamp
    const timestamp = new Date().toISOString()
    signups.push({
      name,
      email,
      timestamp,
    })

    // Write back to file
    try {
      await fs.writeFile(filePath, JSON.stringify(signups, null, 2))
      console.log("Successfully saved signup data to local file")
    } catch (writeError) {
      console.error("Error writing to file:", writeError)
      // Continue to webhook - we'll try our best to save the data
    }

    // Try to send data to n8n webhook
    console.log("Attempting to send data to webhook...")

    try {
      const webhookUrl = "https://primary-production-de7c.up.railway.app/webhook/f6ecc288-2737-4d47-a81e-3804b3016d55"

      console.log("Sending POST request to:", webhookUrl)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          timestamp,
        }),
      })

      console.log("Webhook response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Webhook error response:", errorText)
        console.error(`Webhook failed with status ${response.status}`)

        // Don't throw here - we'll return a partial success since we saved locally
        return {
          success: true,
          webhookSuccess: false,
          localSaveSuccess: true,
          message: "Your information was saved, but there was an issue with our notification system.",
        }
      }

      console.log("Webhook submission successful")
      return {
        success: true,
        webhookSuccess: true,
        localSaveSuccess: true,
        message: "Your signup was successfully processed.",
      }
    } catch (webhookError) {
      // Log the webhook error but don't fail the overall operation
      console.error("Webhook request failed:", webhookError)

      return {
        success: true,
        webhookSuccess: false,
        localSaveSuccess: true,
        message: "Your information was saved, but there was an issue with our notification system.",
      }
    }
  } catch (error) {
    console.error("Critical error in saveSignup:", error)
    return {
      success: false,
      webhookSuccess: false,
      localSaveSuccess: false,
      message: "We couldn't process your signup. Please try again later.",
    }
  }
}
