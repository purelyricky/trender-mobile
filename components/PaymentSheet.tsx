import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, TextInput, ScrollView } from 'react-native';
import { X, CreditCard, CheckCircle2 } from 'lucide-react-native';

interface PaymentSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  total: number;
}

const PaymentSheet: React.FC<PaymentSheetProps> = ({
  isVisible,
  onClose,
  onPaymentSuccess,
  total,
}) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Test card details
  const testCardDetails = {
    number: '4242 4242 4242 4242',
    expiry: '12/25',
    cvc: '123',
    name: 'Test User',
  };

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 1500);
  };

  const handleCloseSuccess = async () => {
    setShowSuccessModal(false);
    try {
      // Wait for payment success operations to complete before closing
      await onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Error during payment success handling:', error);
      // Still close the modal even if there's an error
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-5 h-[80%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-rubik-bold text-xl text-black-300">Payment</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Test Mode Banner */}
            <View className="bg-yellow-100 p-3 rounded-xl mb-6">
              <Text className="font-rubik-medium text-yellow-800 text-center">
                TEST MODE - No actual payment will be processed
              </Text>
            </View>

            {/* Card Information */}
            <View className="mb-6">
              <Text className="font-rubik-medium text-base text-black-300 mb-4">
                Card Information
              </Text>
              
              <View className="bg-gray-50 p-4 rounded-xl mb-4">
                <Text className="font-rubik text-xs text-black-100 mb-1">Card Number</Text>
                <View className="flex-row items-center">
                  <CreditCard size={20} color="#666" className="mr-2" />
                  <TextInput
                    value={testCardDetails.number}
                    editable={false}
                    className="font-rubik text-base text-black-300 flex-1"
                  />
                </View>
              </View>

              <View className="flex-row gap-4 mb-4">
                <View className="flex-1 bg-gray-50 p-4 rounded-xl">
                  <Text className="font-rubik text-xs text-black-100 mb-1">Expiry Date</Text>
                  <TextInput
                    value={testCardDetails.expiry}
                    editable={false}
                    className="font-rubik text-base text-black-300"
                  />
                </View>
                <View className="flex-1 bg-gray-50 p-4 rounded-xl">
                  <Text className="font-rubik text-xs text-black-100 mb-1">CVC</Text>
                  <TextInput
                    value={testCardDetails.cvc}
                    editable={false}
                    className="font-rubik text-base text-black-300"
                  />
                </View>
              </View>

              <View className="bg-gray-50 p-4 rounded-xl">
                <Text className="font-rubik text-xs text-black-100 mb-1">Cardholder Name</Text>
                <TextInput
                  value={testCardDetails.name}
                  editable={false}
                  className="font-rubik text-base text-black-300"
                />
              </View>
            </View>

            {/* Order Summary */}
            <View className="mb-8">
              <Text className="font-rubik-medium text-base text-black-300 mb-4">
                Order Summary
              </Text>
              
              <View className="bg-gray-50 p-4 rounded-xl">
                <View className="flex-row justify-between mb-2">
                  <Text className="font-rubik text-sm text-black-200">Subtotal</Text>
                  <Text className="font-rubik text-sm text-black-300">
                    HUF {(total * 0.787).toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="font-rubik text-sm text-black-200">Tax (27%)</Text>
                  <Text className="font-rubik text-sm text-black-300">
                    HUF {(total * 0.213).toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row justify-between pt-2 border-t border-gray-200">
                  <Text className="font-rubik-medium text-base text-black-300">Total</Text>
                  <Text className="font-rubik-bold text-lg text-primary-300">
                    HUF {total.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Payment Button */}
          <TouchableOpacity 
            className="w-full h-14 bg-primary-300 rounded-xl flex-row items-center justify-center mt-4"
            onPress={handlePayment}
          >
            <Text className="font-rubik-bold text-white text-base">
              Pay HUF {total.toLocaleString()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View className="bg-white rounded-3xl p-6 w-[90%] items-center">
            <CheckCircle2 size={80} color="#10b981" className="mb-4" />
            <Text className="font-rubik-bold text-xl text-black-300 mb-2 text-center">
              Payment Successful!
            </Text>
            <Text className="font-rubik text-sm text-black-200 mb-6 text-center">
              Your order has been placed successfully. Thank you for shopping with us!
            </Text>
            <TouchableOpacity 
              className="w-full h-12 bg-primary-300 rounded-xl flex-row items-center justify-center"
              onPress={handleCloseSuccess}
            >
              <Text className="font-rubik-bold text-white">
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default PaymentSheet;