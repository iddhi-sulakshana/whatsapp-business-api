import { Router } from "express";
import { OrderItem } from "../../app/types";
import { createOrder, updateOrderPaid } from "../../app/interface";
import { healthCheck } from "../middlewares/applicationChecl";

const router = Router();

router.post("/create", healthCheck, async (req, res) => {
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

router.put("/paid", healthCheck, async (req, res) => {
    // update the order status to paid for the given order id with phone number
    const phoneNumber: string = req.body.phoneNumber;
    const orderId: string = req.body.orderId;

    // check if the phone number is valid
    if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    // check if the order id is valid
    if (!orderId) {
        return res.status(400).json({ message: "Order id is required" });
    }

    // check if the number is in the correct format
    // Format is +94xxxxxxxxx
    const phoneNumberRegex = /^\+94\d{9}$/;
    if (!phoneNumberRegex.test(phoneNumber)) {
        return res.status(400).json({ message: "Invalid phone number" });
    }

    // check if the order is in the correct format
    // format is 4PL8FBD2WU6 this kind of string
    const orderIdRegex = /^[A-Z0-9]{11}$/;
    if (!orderIdRegex.test(orderId)) {
        return res.status(400).json({ message: "Invalid order id" });
    }

    // update the order status
    const isUpdated = await updateOrderPaid(phoneNumber, orderId);

    if (!isUpdated) {
        return res
            .status(500)
            .json({ message: "Failed to update order status" });
    }

    return res
        .status(200)
        .json({ message: "Order status updated successfully" });
});

export default router;
