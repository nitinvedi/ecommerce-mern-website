import React from "react";
import { Check } from "lucide-react";

export default function CheckoutProgress({ currentStep }) {
  const steps = [
    { id: 1, name: "Cart", path: "/cart" },
    { id: 2, name: "Address", path: "/checkout" },
    { id: 3, name: "Payment", path: "/checkout" },
    { id: 4, name: "Confirmation", path: "/order-success" },
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200 py-6">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step.id < currentStep
                      ? "bg-green-500 text-white"
                      : step.id === currentStep
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check size={20} />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    step.id <= currentStep
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {step.name}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 -mt-8 transition-all ${
                    step.id < currentStep
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
