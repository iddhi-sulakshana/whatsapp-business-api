# WhatsApp Business API with Puppeteer

This project provides an API that interacts with WhatsApp Web using Puppeteer, allowing you to create orders and mark them as paid. The server can be started using an npm script, which initializes Puppeteer, starts an HTTP server, and a WebSocket server for handling authentication and status updates.

## 🚨 Important Note

**The file located at `src/app/utils.ts` must be updated whenever WhatsApp introduces new tags or changes existing ones.**

If you notice any discrepancies or updates required in this file, **please raise a pull request** to ensure the API continues to function correctly with WhatsApp's latest changes.

## Getting Started

### Prerequisites

-   Node.js
-   npm, bun or yarn
-   A WhatsApp Business account

### Installation

1. Clone this repository.
2. Install dependencies by running:

    ```bash
    npm install
    ```

### Running the Server

Start the server by running:

```bash
npm run dev
```

This command will start the Puppeteer web browser and initialize the HTTP and WebSocket servers.

### WebSocket Server

The WebSocket server listens on `{url}/socket/auth` and provides the following events:

-   `change_qr`: Emitted when the QR code for WhatsApp Web authentication is updated.
-   `change_online`: Emitted when the WhatsApp Web status changes (online/offline).
-   `change_logged`: Emitted when the user is authenticated.

Clients must listen to the `change_qr` event to obtain the QR code for authentication. Once authenticated, users can initiate orders through the HTTP API.

## API Endpoints

### 1. Create Order

**Endpoint:** `{url}/api/whatsapp/order/create`

**Method:** `POST`

**Description:** This endpoint allows you to create an order for a specific phone number.

**Request Body:**

```json
{
    "phoneNumber": "+94781940178",
    "orderList": [
        {
            "name": "Chocolate",
            "price": "100",
            "quantity": "1"
        }
    ]
}
```

-   `phoneNumber`: The recipient's phone number in international format.
-   `orderList`: An array of items to be ordered, where each item includes `name`, `price`, and `quantity`.

**Response:**

```json
{
    "message": "Order created successfully",
    "orderId": "ORDER #4PPG53MMO02"
}
```

### 2. Mark Order as Paid

**Endpoint:** `{url}/api/whatsapp/order/paid`

**Method:** `PUT`

**Description:** This endpoint allows you to mark an order as paid.

**Request Body:**

```json
{
    "phoneNumber": "+94781940178",
    "orderId": "4PPG53MMO02"
}
```

-   `phoneNumber`: The recipient's phone number in international format.
-   `orderId`: The ID of the order that needs to be marked as paid.

**Response:**

```json
{
    "message": "Order status updated successfully"
}
```

## WebSocket Client Example

Here's an example of how to listen to WebSocket events using JavaScript:

```javascript
const socket = new WebSocket("ws://{url}/socket/auth");

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.event === "change_qr") {
        console.log("QR Code:", data.qr);
    } else if (data.event === "change_online") {
        console.log("Online Status:", data.online);
    } else if (data.event === "change_logged") {
        console.log("Authentication Status:", data.logged);
    }
};

socket.onopen = function () {
    console.log("WebSocket connection established.");
};
```

## TODO

-   [ ] Receive Incoming Messages
-   [ ] Send Text Messages
-   [ ] Receive Media (Images, Videos, Documents)
-   [ ] Send Media (Images, Videos, Documents)
-   [ ] Auto Reply to Messages
-   [ ] Broadcast Messages
-   [ ] Group Chat Management
-   [ ] Message Template Management
-   [ ] Webhook Support
-   [ ] Docker compatibility

## Conclusion

This API allows seamless interaction with WhatsApp Web through Puppeteer, making it easy to manage orders and automate business processes. Feel free to contribute or customize it according to your business needs.
