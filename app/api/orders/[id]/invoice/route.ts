import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import dbConnect from '@/app/lib/mongodb';
import Order from '@/app/models/Order';
import BusinessProfile from '@/app/models/BusinessProfile';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const order = await Order.findById(params.id)
      .populate('clientId', 'name email phone address')
      .populate('items.measurementId');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.designerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get business profile
    const businessProfile = await BusinessProfile.findOne({ userId: session.user.id });

    if (!businessProfile) {
      return NextResponse.json({ 
        error: 'Business profile not found. Please set up your business profile first.' 
      }, { status: 404 });
    }

    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(order, businessProfile);

    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateInvoiceHTML(order: any, business: any): string {
  const client = order.clientId;
  const currentDate = new Date().toLocaleDateString();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.orderId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      border-bottom: 3px solid ${business.primaryColor};
      padding-bottom: 20px;
    }
    
    .business-info {
      flex: 1;
    }
    
    .logo {
      max-width: 150px;
      max-height: 80px;
      margin-bottom: 10px;
    }
    
    .business-name {
      font-size: 24px;
      font-weight: bold;
      color: ${business.primaryColor};
      margin-bottom: 5px;
    }
    
    .tagline {
      font-size: 14px;
      color: #666;
      font-style: italic;
      margin-bottom: 10px;
    }
    
    .contact-info {
      font-size: 12px;
      color: #666;
      line-height: 1.4;
    }
    
    .invoice-title {
      text-align: right;
    }
    
    .invoice-title h1 {
      font-size: 36px;
      color: ${business.primaryColor};
      margin-bottom: 10px;
    }
    
    .invoice-details {
      font-size: 14px;
      color: #666;
    }
    
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    
    .party {
      flex: 1;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    
    .party:first-child {
      margin-right: 20px;
    }
    
    .party h3 {
      font-size: 14px;
      color: ${business.secondaryColor};
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .party p {
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .items-table thead {
      background: ${business.primaryColor};
      color: white;
    }
    
    .items-table th {
      padding: 12px;
      text-align: left;
      font-size: 14px;
      font-weight: 600;
    }
    
    .items-table tbody tr {
      border-bottom: 1px solid #e0e0e0;
    }
    
    .items-table tbody tr:hover {
      background: #f9f9f9;
    }
    
    .items-table td {
      padding: 12px;
      font-size: 14px;
    }
    
    .text-right {
      text-align: right;
    }
    
    .notes-section {
      margin-top: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-left: 4px solid ${business.primaryColor};
      border-radius: 4px;
    }
    
    .notes-section h3 {
      font-size: 16px;
      margin-bottom: 10px;
      color: ${business.primaryColor};
    }
    
    .notes-section p {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-in-progress { background: #dbeafe; color: #1e40af; }
    .status-completed { background: #d1fae5; color: #065f46; }
    
    @media print {
      body {
        padding: 0;
      }
      
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div class="business-info">
      ${business.logoUrl ? `<img src="${business.logoUrl}" alt="${business.businessName}" class="logo">` : ''}
      <div class="business-name">${business.businessName}</div>
      ${business.tagline ? `<div class="tagline">${business.tagline}</div>` : ''}
      <div class="contact-info">
        ${business.address ? `<div>${business.address}</div>` : ''}
        ${business.phone ? `<div>Phone: ${business.phone}</div>` : ''}
        ${business.email ? `<div>Email: ${business.email}</div>` : ''}
        ${business.website ? `<div>Web: ${business.website}</div>` : ''}
      </div>
    </div>
    
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <div class="invoice-details">
        <p><strong>Invoice #:</strong> ${order.orderId}</p>
        <p><strong>Date:</strong> ${currentDate}</p>
        <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
        <p><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>
      </div>
    </div>
  </div>
  
  <div class="parties">
    <div class="party">
      <h3>Bill To</h3>
      <p><strong>${client.name}</strong></p>
      ${client.email ? `<p>${client.email}</p>` : ''}
      ${client.phone ? `<p>${client.phone}</p>` : ''}
      ${client.address ? `<p>${client.address}</p>` : ''}
    </div>
    
    <div class="party">
      <h3>Order Details</h3>
      <p><strong>Title:</strong> ${order.title}</p>
      <p><strong>Status:</strong> 
        <span class="status-badge status-${order.status}">
          ${order.status.replace('_', ' ').toUpperCase()}
        </span>
      </p>
      <p><strong>Priority:</strong> ${order.priority.toUpperCase()}</p>
      ${order.description ? `<p><strong>Description:</strong> ${order.description}</p>` : ''}
    </div>
  </div>
  
  <table class="items-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Item Description</th>
        <th>Quantity</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map((item: any, index: number) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${item.clothingType.replace('_', ' ').toUpperCase()}</strong>
            ${item.fabric ? `<br><small>Fabric: ${item.fabric}</small>` : ''}
            ${item.color ? `<br><small>Color: ${item.color}</small>` : ''}
          </td>
          <td>${item.quantity}</td>
          <td>
            ${item.measurementId ? '<span style="color: #059669;">✓ Measurements on file</span>' : '<span style="color: #dc2626;">No measurements</span>'}
            ${item.notes ? `<br><small>${item.notes}</small>` : ''}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  ${order.notes ? `
    <div class="notes-section">
      <h3>Additional Notes</h3>
      <p>${order.notes}</p>
    </div>
  ` : ''}
  
  ${order.images && order.images.length > 0 ? `
    <div class="notes-section">
      <h3>Reference Images</h3>
      <p>${order.images.length} image(s) attached to this order</p>
    </div>
  ` : ''}
  
  <div class="footer">
    <p>Thank you for your business!</p>
    ${business.socialMedia?.instagram || business.socialMedia?.facebook ? `
      <p style="margin-top: 10px;">
        ${business.socialMedia.instagram ? `Instagram: ${business.socialMedia.instagram} ` : ''}
        ${business.socialMedia.facebook ? `Facebook: ${business.socialMedia.facebook}` : ''}
      </p>
    ` : ''}
    <p style="margin-top: 10px;">This invoice was generated on ${currentDate}</p>
  </div>
  
  <div class="no-print" style="margin-top: 40px; text-align: center;">
    <button onclick="window.print()" style="
      background: ${business.primaryColor};
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      margin-right: 10px;
    ">
      Print Invoice
    </button>
    <button onclick="window.close()" style="
      background: #6b7280;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
    ">
      Close
    </button>
  </div>
</body>
</html>
  `;
}