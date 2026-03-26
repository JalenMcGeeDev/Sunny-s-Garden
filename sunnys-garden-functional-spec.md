# Sunny's Garden — Functional Specification

**Document Type:** Functional Specification  
**Prepared for:** McG Works LLC  
**Version:** 1.0 — Initial Draft  
**Date:** March 2026  
**Status:** For Review  
**Scope:** Public storefront, guest checkout, admin backend  

---

## Table of Contents

1. [Purpose & Background](#1-purpose--background)
2. [Users & Roles](#2-users--roles)
   - 2.1 Public Visitor
   - 2.2 Site Administrator
3. [Products](#3-products)
   - 3.1 Product Catalog
   - 3.2 Variants
4. [Public Storefront](#4-public-storefront)
   - 4.1 Home Page
   - 4.2 Shop Page
   - 4.3 About Page
   - 4.4 Order Confirmation Page
5. [Purchasing Flow](#5-purchasing-flow)
   - 5.1 Product Selection
   - 5.2 Checkout
   - 5.3 Payment
   - 5.4 Post-Purchase
6. [Order Management](#6-order-management)
   - 6.1 Order Record
   - 6.2 Order Statuses
   - 6.3 Notifications
7. [Admin Backend](#7-admin-backend)
   - 7.1 Authentication
   - 7.2 Order Management
   - 7.3 Product Management
   - 7.4 Content Management
8. [Business Rules](#8-business-rules)
9. [Out of Scope](#9-out-of-scope)

---

## 1. Purpose & Background

Sunny's Garden sells handcrafted cedar planter boxes — the Sunny Collection — through in-person markets and pop-up events. This specification describes the functional requirements for a website that extends that sales channel online. The site allows customers to browse the product line, understand what they're buying, and complete a purchase without needing to attend an event or create an account.

The site also includes a private admin backend that allows the business owner to manage incoming orders, update product information, and edit the content of the About page — all without writing code or modifying files directly.

The scope of this document covers the complete customer-facing storefront and the full admin backend. Payment processing is handled by Stripe. Customer and order data is stored in Supabase. No customer account creation is required at any point.

---

## 2. Users & Roles

### 2.1 Public Visitor

The public visitor is any person who lands on the website. They may browse freely without identifying themselves. They may complete a purchase by providing only the information required by Stripe for payment and shipping — name, email address, shipping address, and payment details. They are not required to create an account, set a password, or log in at any point.

After a successful purchase, the system sends the visitor a confirmation email. Beyond that, the visitor has no persistent relationship with the site. They cannot log in to check order history, and they receive no account-related communications.

### 2.2 Site Administrator

The site administrator is the business owner. There is exactly one administrator account. The administrator logs in to the admin backend using an email address and password. They are not a public user — the admin login page is not linked from anywhere on the public site.

Once logged in, the administrator can view and manage all orders, edit product information, and edit the content of the About page. The administrator cannot create additional admin accounts through the interface; additional accounts, if ever needed, are created directly in the backend infrastructure.

---

## 3. Products

### 3.1 Product Catalog

The site sells exactly three products at launch. All three are cedar planter boxes constructed using a frame-and-panel method. They differ in size, planting configuration, and intended use.

| Product Name | Footprint | Planting Depth | Configuration |
|---|---|---|---|
| **Single Sunny** | 5 ft wide × 2 ft tall | 18 inches | One open planting bay |
| **Tiny Sunny** | 2 ft wide × 2 ft tall | 18 inches | One open planting bay |
| **Double Sunny** | Matches Single Sunny width | Two rows × 8 inches each | Two stacked planting bays joined at all four corners by continuous cedar posts, with open air between the rows |

### 3.2 Variants

Every product is available in two variants: **No Legs** and **With Legs**. These are distinct purchasable options, not a cosmetic toggle. Each variant has its own price and maps to a distinct line item in the payment system. No other variants exist at this time.

The variant is a required selection before a customer can proceed to checkout. The No Legs variant is presented as the default.

---

## 4. Public Storefront

### 4.1 Home Page

The home page is the primary landing page of the site. Its purpose is to orient new visitors to the brand and direct them toward the shop. It contains the following sections:

**Hero**  
A full-width image of a planter with established plants. A headline, a brief supporting line, and a primary call-to-action button that navigates the visitor to the Shop page. The hero image and copy are not editable through the admin; they are part of the site's design. If this needs to change frequently, it can be promoted to a CMS field in a future version.

**Collection Preview**  
A grid displaying all three products. Each item shows a product photo, the product name, a one-line description, a starting price, and a link to that product's full listing on the Shop page. This section is driven entirely by the product data stored in the database, so it automatically reflects any changes made through the admin.

**Brand Story Excerpt**  
A short passage — two or three sentences — introducing the maker and the craft. This is followed by a link to the About page. The content of this excerpt is hardcoded in the design and is not editable through the admin.

**Footer**  
The footer appears on every public page. It contains the site name, navigation links to Home, Shop, and About, a contact email address, and a link to the business's Instagram account. The contact email and Instagram URL are configurable through the site's environment settings and do not require a code change to update.

### 4.2 Shop Page

The shop page presents all three products in full detail. Each product occupies its own section of the page and includes the following elements:

- One or more product photographs
- The product name and full description
- A specification summary showing footprint dimensions, planting depth, and number of planting rows
- A variant selector — a toggle control labeled "No Legs" and "With Legs" — that updates the displayed price when switched
- A "Buy Now" button that initiates the checkout process for the selected variant

All product content — name, description, specifications, prices, photographs — is pulled from the database. Changes made through the admin product editor are reflected on this page immediately.

The "Buy Now" button does not add an item to a cart. It immediately initiates a Stripe Checkout session for the selected product and variant. There is no multi-item cart in this version of the site.

### 4.3 About Page

The About page tells the story of Sunny's Garden — who makes the planters, why, and how. It contains a headline, a body section of multiple paragraphs, and one or two photographs. All content on this page is stored in the database and is editable in its entirety through the admin backend. No portion of the About page is hardcoded.

### 4.4 Order Confirmation Page

After a successful payment, Stripe redirects the customer to the order confirmation page. This page displays a summary of the completed order, including the product purchased, the selected variant, the total amount charged, the customer's name, and their email address. It also informs the customer that a confirmation email has been sent.

This page reads order details directly from Stripe using the session identifier passed in the URL. It does not require the customer to be logged in or to have an account. Once the page has loaded and been read by the customer, it serves no further function — it is a one-time receipt view.

> **Note:** The confirmation page is accessible to anyone who has the URL. This is intentional and consistent with how most e-commerce confirmation pages function. No sensitive financial data beyond the order summary is displayed.

---

## 5. Purchasing Flow

### 5.1 Product Selection

The customer arrives at the Shop page and reviews the available planters. They select a variant using the Legs / No Legs toggle on the product they want to purchase. The displayed price updates immediately to reflect their selection. When ready, they click "Buy Now."

### 5.2 Checkout

Clicking "Buy Now" sends the selected product and variant information to the server. The server creates a Stripe Checkout Session and returns a URL. The customer's browser is then redirected to that Stripe-hosted checkout page.

On the Stripe checkout page, the customer provides their name, email address, shipping address, and payment information. The customer's card number and payment credentials are entered directly into Stripe's interface and are never processed by or stored on the Sunny's Garden server.

Stripe displays the item name, variant, and price to the customer during checkout so they can confirm what they are purchasing before completing payment.

### 5.3 Payment

When the customer submits payment, Stripe processes the transaction. If payment is declined, Stripe presents the customer with an error and allows them to try again — this requires no handling on the Sunny's Garden side. If the customer abandons checkout, no order is created.

When payment is successfully collected, Stripe sends a notification to the Sunny's Garden server via webhook. This notification is the authoritative trigger for order creation. The server validates the notification's authenticity, then creates an order record in the database and sends a confirmation email to the customer.

### 5.4 Post-Purchase

1. Stripe redirects the customer to the **Order Confirmation page** on the Sunny's Garden site.
2. The confirmation page displays the order summary retrieved from Stripe.
3. The customer receives a **confirmation email** containing the same order summary. This email is sent automatically by the server after the webhook is processed.
4. The **administrator receives a notification email** informing them of the new order, including the customer's name, product, variant, and shipping address.
5. The order appears in the **admin dashboard** with a status of *New*.

---

## 6. Order Management

### 6.1 Order Record

Each completed purchase creates one order record in the database. The order record captures the following information at the time of purchase and does not change if product information is later edited:

- Customer full name
- Customer email address
- Customer phone number (if provided during checkout)
- Full shipping address
- Product name and variant, recorded as a text snapshot
- Total amount charged in cents
- Stripe session identifier and payment intent identifier
- Date and time of purchase

The following fields are writeable by the administrator after the order is created:

- Order status
- Tracking number
- Internal admin notes (not visible to the customer)

### 6.2 Order Statuses

Every order has a status that reflects its current fulfillment state. The available statuses are:

| Status | Meaning |
|---|---|
| **New** | Payment confirmed. No action taken yet by the administrator. |
| **In Progress** | The planter is being built. |
| **Shipped** | The planter has been handed off to a carrier. A tracking number may be present. |
| **Delivered** | The planter has been received by the customer. |
| **Cancelled** | The order has been cancelled. Refund processing, if applicable, is handled separately through Stripe. |

Status changes are made manually by the administrator. The system does not automatically advance order status based on external signals such as carrier tracking.

### 6.3 Notifications

The system sends two types of automated email notifications:

**Order Confirmation (to Customer)**  
Sent once, immediately after a successful payment is confirmed by Stripe. Contains the product name, variant, total amount paid, and shipping address. Does not include tracking information.

**New Order Alert (to Administrator)**  
Sent once, at the same time as the customer confirmation. Contains all order details including the customer's shipping address, so the administrator has everything needed to fulfill the order directly from the email.

> **Note:** In this version, no automated email is sent to the customer when the order status changes to Shipped. The administrator may communicate tracking information manually via email. Automated shipping notifications are listed as out of scope and may be added in a future release.

---

## 7. Admin Backend

The admin backend is a private, password-protected section of the website accessible at a dedicated path. It is not linked from any public page. Its purpose is to give the administrator full control over orders, product information, and the About page content without requiring code changes or direct database access.

### 7.1 Authentication

The administrator accesses the admin backend by navigating to the admin login page and entering their email address and password. There is no "forgot password" flow in the admin interface itself — password resets are handled through the backend infrastructure directly. There is no account registration screen; the administrator account is created once during setup and is not self-service.

All admin pages require an active authenticated session. Any attempt to access an admin page without a valid session redirects the visitor to the admin login page. The session remains active until the administrator explicitly logs out or the session expires after a period of inactivity.

### 7.2 Order Management

**Order List**  
The default view of the admin backend is a list of all orders, sorted with the most recent orders first. The list displays each order's date, customer name, product and variant purchased, total amount, and current status. The list can be filtered by status so the administrator can quickly view, for example, only orders that are currently New or only orders that have been Shipped. Clicking any order in the list opens the Order Detail view for that order.

**Order Detail**  
The Order Detail view displays the complete order record for a single order. All customer information, product information, and payment information is shown in read-only form. The administrator can edit the following fields directly on this view:

- **Status** — a dropdown control offering all five status values
- **Tracking Number** — a free-text field for entering a carrier tracking number
- **Admin Notes** — a multi-line text field for internal notes, not visible to the customer

Changes are saved by clicking a Save button. The administrator receives confirmation that the changes have been saved. The page does not auto-save.

### 7.3 Product Management

The product management section allows the administrator to edit all user-facing information for each of the three products. Because there are only three products and no need to create or delete products, this section presents a simple editing form for each product — not a list-and-create interface.

The following fields are editable per product:

- **Name** — the display name shown on the shop page and in all references
- **Tagline** — a single short line used in the collection preview on the home page
- **Description** — the full product description shown on the shop page, supporting multiple paragraphs
- **Dimensions** — structured fields for width, height, planting depth, and number of rows; these populate the specification table on the shop page
- **Price (No Legs)** — the display price for the no-legs variant, entered in dollars
- **Price (With Legs)** — the display price for the legs variant, entered in dollars
- **Stripe Price ID (No Legs)** — the identifier from the Stripe Dashboard for the no-legs price; this is what gets sent to Stripe when a customer buys this variant
- **Stripe Price ID (With Legs)** — the identifier from the Stripe Dashboard for the legs price
- **Photos** — up to five images per product; the administrator can upload new images, remove existing ones, and reorder them; the first image in the list is used as the primary product photo
- **Visibility** — a toggle to hide a product from the shop page without deleting it

> **Important:** The Stripe Price IDs entered here must match prices that exist in the Stripe Dashboard. If a Stripe Price ID is entered incorrectly, customers attempting to purchase that product will receive an error. When prices change, the administrator must update the price in Stripe first, then paste the new Stripe Price ID into this field.

### 7.4 Content Management

The content management section allows the administrator to edit the About page in its entirety. The editor presents the following fields:

- **Headline** — the main heading displayed at the top of the About page
- **Body** — the main text content of the page; supports basic rich text formatting including bold, italic, paragraph breaks, and simple lists
- **Primary Photo** — the main image displayed on the About page; uploaded directly through the admin
- **Secondary Photo** — an optional second image; may be left empty

The administrator can preview the About page in a new browser tab before saving changes. Clicking Save commits all changes to the database and immediately updates the live About page.

---

## 8. Business Rules

| Rule | Definition |
|---|---|
| **One item per order** | Each checkout session is for exactly one planter. Customers cannot add multiple items to a single purchase. This is an intentional constraint for the initial release, consistent with the made-to-order nature of the product. |
| **Variant is required** | A customer cannot proceed to checkout without selecting either "No Legs" or "With Legs." The Buy Now button is inactive until a selection has been made. The default selection is "No Legs." |
| **Orders are created only on confirmed payment** | An order record is created in the database only after a successful payment confirmation is received from Stripe via webhook. Abandoned checkouts and failed payments do not create order records. |
| **Order data is snapshotted at purchase time** | Product name, variant, and price are recorded in the order record at the time of purchase. Subsequent changes to product information in the admin do not alter historical order records. |
| **Webhook idempotency** | If Stripe delivers the same payment confirmation more than once, the system must not create duplicate order records. The Stripe session identifier is used to detect and discard duplicate events. |
| **Prices are authoritative in Stripe** | The amount charged to a customer is determined entirely by the Stripe Price ID used at checkout. The display prices shown on the website are for informational purposes only. Any mismatch between the two is an admin configuration error, not a system bug. |
| **Refunds are out of band** | Refund processing is not handled through the admin backend. If a refund is necessary, the administrator processes it directly through the Stripe Dashboard. A Cancelled order status in the admin is a label only. |
| **No public product creation or deletion** | The set of products is fixed at three. The admin can edit product information and toggle visibility, but cannot add new products or permanently delete existing ones through the admin interface. |

---

## 9. Out of Scope

The following capabilities are explicitly not part of this version of the site. They may be considered for future releases but must not influence design or development decisions for the initial build.

- **Customer accounts and order history.** Customers cannot create accounts, log in, or view past orders.
- **Multi-item shopping cart.** Each checkout handles one product at a time.
- **Discount codes and promotions.** Stripe supports coupon codes, but this site will not expose that capability in this version.
- **Inventory tracking.** The system does not track stock levels or prevent purchases when inventory is unavailable.
- **Automated shipping notifications.** The system does not send customers tracking information when an order ships.
- **Product reviews or ratings.**
- **Multiple administrators.** Only one admin account is supported in this version.
- **Blog or editorial content.**
- **Custom domain email management.** The contact email address is a display link only; incoming email is not handled by this system.
- **Sales tax calculation.** Stripe Tax may be enabled at the Stripe account level independently of this build, but tax configuration is not part of this specification.
