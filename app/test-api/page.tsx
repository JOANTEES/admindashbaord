"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";

export default function TestApiPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const tests = [];

    // Test 1: Basic API health
    try {
      const healthResponse = await fetch("http://localhost:5000/");
      const healthData = await healthResponse.text();
      tests.push({
        name: "API Health Check",
        status: healthResponse.ok ? "✅ Success" : "❌ Failed",
        data: healthData,
      });
    } catch (error) {
      tests.push({
        name: "API Health Check",
        status: "❌ Failed",
        data: `Error: ${error}`,
      });
    }

    // Test 2: Delivery zones endpoint
    try {
      const zonesResponse = await fetch(
        "http://localhost:5000/api/delivery-zones"
      );
      const zonesData = await zonesResponse.json();
      tests.push({
        name: "Delivery Zones (Public)",
        status: zonesResponse.ok ? "✅ Success" : "❌ Failed",
        data: zonesData,
      });
    } catch (error) {
      tests.push({
        name: "Delivery Zones (Public)",
        status: "❌ Failed",
        data: `Error: ${error}`,
      });
    }

    // Test 3: Delivery zones admin endpoint
    try {
      const adminResponse = await fetch(
        "http://localhost:5000/api/delivery-zones/admin"
      );
      const adminData = await adminResponse.json();
      tests.push({
        name: "Delivery Zones (Admin)",
        status: adminResponse.ok ? "✅ Success" : "❌ Failed",
        data: adminData,
      });
    } catch (error) {
      tests.push({
        name: "Delivery Zones (Admin)",
        status: "❌ Failed",
        data: `Error: ${error}`,
      });
    }

    // Test 4: Other endpoints
    try {
      const usersResponse = await fetch("http://localhost:5000/api/users");
      const usersData = await usersResponse.json();
      tests.push({
        name: "Users Endpoint",
        status: usersResponse.ok ? "✅ Success" : "❌ Failed",
        data: usersData,
      });
    } catch (error) {
      tests.push({
        name: "Users Endpoint",
        status: "❌ Failed",
        data: `Error: ${error}`,
      });
    }

    setResults(tests);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Tester</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testEndpoints} disabled={loading}>
            {loading ? "Testing..." : "Test All Endpoints"}
          </Button>

          {results && (
            <div className="mt-6 space-y-4">
              {results.map((test: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">
                      <strong>Status:</strong> {test.status}
                    </p>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
