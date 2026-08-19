import express from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import User from "../models/User.js";

const router = express.Router();

router.post(
  "/webhooks/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      // Verify the webhook signature
      const event = await verifyWebhook(req);

      const eventType = event.type;

      console.log("Clerk webhook:", eventType);

      // USER CREATED
      if (eventType === "user.created") {
        const clerkUser = event.data;

        const existingUser = await User.findOne({
          clerkId: clerkUser.id,
        });

        if (!existingUser) {
          await User.create({
            clerkId: clerkUser.id,
            email: clerkUser.email_addresses[0]?.email_address,
            username:
              clerkUser.username ||
              clerkUser.first_name ||
              "user",
            stats: {},
          });

          console.log("User created in database:", clerkUser.id);
        }
      }

      // USER UPDATED
      if (eventType === "user.updated") {
        const clerkUser = event.data;

        await User.findOneAndUpdate(
          { clerkId: clerkUser.id },
          {
            email: clerkUser.email_addresses[0]?.email_address,
            username:
              clerkUser.username ||
              clerkUser.first_name ||
              "user",
          }
        );

        console.log("User updated in database:", clerkUser.id);
      }

      // USER DELETED
      if (eventType === "user.deleted") {
        await User.findOneAndDelete({
          clerkId: event.data.id,
        });

        console.log("User deleted from database:", event.data.id);
      }

      return res.status(200).json({
        success: true,
      });
    } catch (err) {
      console.error("Webhook error:", err);

      return res.status(400).json({
        error: "Webhook verification failed",
      });
    }
  }
);

export default router;