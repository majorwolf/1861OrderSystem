#!/usr/bin/env node

/**
 * QR Code Generator for 1861 Public House Tables
 * 
 * This script generates QR codes for all tables in the database.
 * It fetches tables from the database and creates QR code images for each one.
 * 
 * Usage: 
 * - Set the BASE_URL environment variable to your server address
 * - Run: node scripts/generate-qr-codes.js
 */

import { createCanvas } from 'canvas';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { db } from '../server/db.js';
import { tables } from '../shared/schema.js';

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const OUTPUT_DIR = path.join(process.cwd(), 'qr-codes');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Canvas setup for QR code generation with logo
async function generateQRCodeWithLogo(url, outputPath, tableNumber) {
  // Create canvas
  const canvas = createCanvas(1000, 1150);
  const context = canvas.getContext('2d');
  
  // Fill background
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Generate QR code on canvas
  await QRCode.toCanvas(
    canvas.getContext('2d'),
    url,
    {
      width: 900,
      margin: 1,
      x: 50,
      y: 50,
      color: {
        dark: '#000080', // Navy blue for 1861 Public House brand
        light: '#ffffff',
      },
    }
  );
  
  // Add table number and instructions
  context.fillStyle = '#000080'; // Navy blue
  context.font = 'bold 80px Arial';
  context.textAlign = 'center';
  context.fillText(`Table ${tableNumber}`, canvas.width / 2, canvas.height - 100);
  
  context.font = '40px Arial';
  context.fillText('Scan to order', canvas.width / 2, canvas.height - 50);
  
  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Generated QR code for Table ${tableNumber} at ${outputPath}`);
}

async function main() {
  try {
    // Fetch all tables from the database
    const allTables = await db.select().from(tables);
    
    console.log(`Generating QR codes for ${allTables.length} tables...`);
    
    // Generate QR code for each table
    for (const table of allTables) {
      const url = `${BASE_URL}/customer?table=${table.tableNumber}`;
      const outputPath = path.join(OUTPUT_DIR, `table-${table.tableNumber}.png`);
      
      await generateQRCodeWithLogo(url, outputPath, table.tableNumber);
    }
    
    console.log(`All QR codes generated in ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('Error generating QR codes:', error);
    process.exit(1);
  }
}

main();