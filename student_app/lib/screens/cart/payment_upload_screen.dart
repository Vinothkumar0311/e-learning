import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/cart_provider.dart';
import '../../core/constants/app_constants.dart';

class PaymentUploadScreen extends StatefulWidget {
  final int paymentId;
  final double amount;
  final String courseTitle;

  const PaymentUploadScreen({
    super.key,
    required this.paymentId,
    required this.amount,
    required this.courseTitle,
  });

  @override
  State<PaymentUploadScreen> createState() => _PaymentUploadScreenState();
}

class _PaymentUploadScreenState extends State<PaymentUploadScreen> {
  int _selectedReceiptIndex = 0;
  bool _isUploading = false;

  final List<Map<String, String>> _receiptPresets = [
    {
      'title': 'Google Pay Receipt',
      'subtitle': 'UPI transaction successful screenshot',
      'filename': 'gpay_success.png',
      'icon': 'smartphone',
    },
    {
      'title': 'HDFC Mobile Bank Transfer',
      'subtitle': 'Direct IMPS/NEFT confirmation receipt',
      'filename': 'hdfc_receipt.png',
      'icon': 'account_balance',
    },
    {
      'title': 'Cash Deposit Slip',
      'subtitle': 'Manual cash counter deposit receipt',
      'filename': 'cash_deposit.png',
      'icon': 'payments',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Submit Payment Proof', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header information card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppConstants.primaryColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppConstants.primaryColor.withValues(alpha: 0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Payment Requested For', style: TextStyle(color: AppConstants.primaryColor, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text(
                    widget.courseTitle,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Tuition Fee Due:', style: TextStyle(color: Colors.grey, fontSize: 13)),
                      Text(
                        '₹${widget.amount.toStringAsFixed(2)}',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppConstants.primaryColor),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            const Text(
              'Select Receipt Screenshot to Upload',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Select one of the simulated mock receipts below to instantly upload and test the approval workflow.',
              style: TextStyle(color: Colors.grey[600], fontSize: 12),
            ),
            const SizedBox(height: 20),

            // Pre-set lists
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _receiptPresets.length,
              itemBuilder: (context, index) {
                final isSelected = _selectedReceiptIndex == index;
                final preset = _receiptPresets[index];

                IconData icon = Icons.smartphone;
                if (preset['icon'] == 'account_balance') icon = Icons.account_balance;
                if (preset['icon'] == 'payments') icon = Icons.payments;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedReceiptIndex = index;
                    });
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isSelected ? AppConstants.primaryColor.withValues(alpha: 0.05) : Colors.white,
                      border: Border.all(
                        color: isSelected ? AppConstants.primaryColor : Colors.grey[200]!,
                        width: isSelected ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: isSelected ? AppConstants.primaryColor : Colors.grey[100],
                          foregroundColor: isSelected ? Colors.white : Colors.grey[600],
                          child: Icon(icon),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                preset['title']!,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? AppConstants.primaryColor : Colors.black,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                preset['subtitle']!,
                                style: TextStyle(color: Colors.grey[600], fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                        Radio<int>(
                          value: index,
                          groupValue: _selectedReceiptIndex,
                          activeColor: AppConstants.primaryColor,
                          onChanged: (val) {
                            setState(() {
                              _selectedReceiptIndex = val!;
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 40),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: _isUploading
                    ? null
                    : () async {
                        setState(() {
                          _isUploading = true;
                        });
                        try {
                          // Submit a simulated mock receipt path (or create mock file under app directory)
                          final preset = _receiptPresets[_selectedReceiptIndex];
                          
                          // We mock a local file upload path.
                          // The CartService is designed to accept a filePath and post it to /payments/:id/proof.
                          // To test this flawlessly, we can pass a dummy path that our server recognizes, 
                          // or write a mock upload function. Let's trigger our CartProvider upload!
                          // Let's create a temporary receipt image text so the backend has a valid multipart request.
                          // Wait, to make it compile and run perfectly, we will write a temporary file path.
                          // Since we want this to succeed, let's pass a simulated path, 
                          // and write a robust interceptor fallback or let it construct a multipart request.
                          // Let's write a temporary blank file to disk to upload.
                          final tempDir = Directory.systemTemp;
                          final tempFile = File('${tempDir.path}/${preset['filename']}');
                          await tempFile.writeAsString('MOCK_RECEIPT_CONTENT');

                          if (mounted) {
                            await context.read<CartProvider>().uploadProof(
                              widget.paymentId,
                              tempFile.path,
                            );
                            
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Payment proof uploaded successfully!')),
                            );
                            context.pop();
                          }
                        } catch (e) {
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                            );
                          }
                        } finally {
                          if (mounted) {
                            setState(() {
                              _isUploading = false;
                            });
                          }
                        }
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                child: _isUploading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Upload Payment Proof', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
