import { NextRequest, NextResponse } from "next/server";

// Default app settings - in production, store these in a database
const defaultSettings = {
  id: 1,
  taxRate: 10.0,
  freeShippingThreshold: 100.0,
  largeOrderQuantityThreshold: 10,
  largeOrderDeliveryFee: 50.0,
  currencySymbol: "₵",
  currencyCode: "GHS",
  updatedAt: new Date().toISOString(),
};

// In-memory storage for demo purposes
// In production, use a proper database like PostgreSQL, MongoDB, etc.
let appSettings = { ...defaultSettings };

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "App settings retrieved successfully",
      settings: appSettings,
    });
  } catch (error) {
    console.error("Error fetching app settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch app settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      taxRate,
      freeShippingThreshold,
      largeOrderQuantityThreshold,
      largeOrderDeliveryFee,
      currencySymbol,
      currencyCode,
    } = body;

    // Update settings with new values
    appSettings = {
      ...appSettings,
      taxRate: taxRate ?? appSettings.taxRate,
      freeShippingThreshold:
        freeShippingThreshold ?? appSettings.freeShippingThreshold,
      largeOrderQuantityThreshold:
        largeOrderQuantityThreshold ?? appSettings.largeOrderQuantityThreshold,
      largeOrderDeliveryFee:
        largeOrderDeliveryFee ?? appSettings.largeOrderDeliveryFee,
      currencySymbol: currencySymbol ?? appSettings.currencySymbol,
      currencyCode: currencyCode ?? appSettings.currencyCode,
      updatedAt: new Date().toISOString(),
    };

    // In production, save to database:
    /*
    await db.appSettings.upsert({
      where: { id: 1 },
      update: appSettings,
      create: appSettings
    })
    */

    console.log("App settings updated:", appSettings);

    return NextResponse.json({
      success: true,
      message: "App settings updated successfully",
      settings: appSettings,
    });
  } catch (error) {
    console.error("Error updating app settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update app settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
