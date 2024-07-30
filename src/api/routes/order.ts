import { Router } from "express";
import { OrderItem } from "../../app/types";
import { createOrder } from "../../app/interface";
import { healthCheck } from "../middlewares/applicationChecl";

const router = Router();

router.post("/", healthCheck, async (req, res) => {
    // create a new order
    const phoneNumber: string = req.body.phoneNumber;
    const orderList: OrderItem[] = req.body.orderList;

    // check if the phone number is valid
    if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    if (!orderList) {
        return res.status(400).json({ message: "Order list is required" });
    }

    // check if the order list is valid
    if (orderList && orderList.length === 0) {
        return res.status(400).json({ message: "Order list is required" });
    }

    // check if the number is in the correct format
    // Format is +94xxxxxxxxx
    const phoneNumberRegex = /^\+94\d{9}$/;
    if (!phoneNumberRegex.test(phoneNumber)) {
        return res.status(400).json({ message: "Invalid phone number" });
    }

    // create the order
    const orderId = await createOrder(phoneNumber, orderList);

    if (!orderId) {
        return res.status(500).json({ message: "Failed to create order" });
    }

    return res
        .status(200)
        .json({ message: "Order created successfully", orderId: orderId });
});

export default router;
