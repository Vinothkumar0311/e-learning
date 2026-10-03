import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../providers/admin_provider.dart';
import '../../models/admin_model.dart';

class AdminPaymentsScreen extends StatefulWidget {
  const AdminPaymentsScreen({super.key});

  @override
  State<AdminPaymentsScreen> createState() => _AdminPaymentsScreenState();
}

class _AdminPaymentsScreenState extends State<AdminPaymentsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().fetchPayments();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showProofDialog(AdminPayment payment) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Text('Proof of Payment #${payment.id}', style: const TextStyle(color: Colors.white, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Student: ${payment.studentName}', style: const TextStyle(color: Colors.white70)),
            Text('Course: ${payment.courseTitle}', style: const TextStyle(color: Colors.white70)),
            Text('Amount: ₹${payment.amount}', style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            payment.proofUrl != null && payment.proofUrl!.isNotEmpty
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      payment.proofUrl!.startsWith('http')
                          ? payment.proofUrl!
                          : '${AppConstants.baseUrl.replaceAll('/api', '')}/${payment.proofUrl}',
                      height: 250,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, err, stack) => Container(
                        height: 150,
                        color: Colors.black26,
                        child: const Center(child: Text('Failed to load receipt image', style: TextStyle(color: Colors.grey))),
                      ),
                    ),
                  )
                : Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(10)),
                    child: const Center(child: Text('No screenshot proof uploaded', style: TextStyle(color: Colors.grey))),
                  ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close', style: TextStyle(color: Colors.grey))),
          if (payment.status == 'PENDING') ...[
            TextButton(
              onPressed: () async {
                Navigator.pop(ctx);
                _verifyPayment(payment.id, 'REJECTED');
              },
              child: const Text('Reject', style: TextStyle(color: Colors.redAccent)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
              onPressed: () async {
                Navigator.pop(ctx);
                _verifyPayment(payment.id, 'VERIFIED');
              },
              child: const Text('Approve Payment', style: TextStyle(color: Colors.white)),
            ),
          ]
        ],
      ),
    );
  }

  Future<void> _verifyPayment(int paymentId, String status) async {
    try {
      await context.read<AdminProvider>().verifyPayment(paymentId, status);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Payment marked as $status'),
            backgroundColor: status == 'VERIFIED' ? Colors.green : Colors.redAccent,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AdminProvider>();
    final payments = provider.payments;

    final pending = payments.where((p) => p.status.toUpperCase() == 'PENDING').toList();
    final verified = payments.where((p) => p.status.toUpperCase() == 'VERIFIED' || p.status.toUpperCase() == 'COMPLETED' || p.status.toUpperCase() == 'PAID').toList();
    final rejected = payments.where((p) => p.status.toUpperCase() == 'REJECTED' || p.status.toUpperCase() == 'FAILED').toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Payment Verification', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppConstants.primaryColor,
          labelColor: AppConstants.primaryColor,
          unselectedLabelColor: Colors.grey,
          tabs: [
            Tab(text: 'Pending (${pending.length})'),
            Tab(text: 'Verified (${verified.length})'),
            Tab(text: 'Rejected (${rejected.length})'),
          ],
        ),
      ),
      body: provider.isLoading && payments.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor))
          : TabBarView(
              controller: _tabController,
              children: [
                _paymentList(pending, isPending: true),
                _paymentList(verified),
                _paymentList(rejected),
              ],
            ),
    );
  }

  Widget _paymentList(List<AdminPayment> list, {bool isPending = false}) {
    if (list.isEmpty) {
      return const Center(child: Text('No payment records in this category', style: TextStyle(color: Colors.grey)));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final item = list[index];
        return Card(
          color: const Color(0xFF1E293B),
          margin: const EdgeInsets.only(bottom: 10),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: isPending ? Colors.orange.withAlpha(30) : ((item.status == 'VERIFIED' || item.status == 'PAID') ? Colors.green.withAlpha(30) : Colors.red.withAlpha(30)),
              child: Icon(
                isPending ? Icons.hourglass_top_rounded : ((item.status == 'VERIFIED' || item.status == 'PAID') ? Icons.check_circle : Icons.cancel),
                color: isPending ? Colors.orangeAccent : ((item.status == 'VERIFIED' || item.status == 'PAID') ? Colors.greenAccent : Colors.redAccent),
              ),
            ),
            title: Text(item.studentName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            subtitle: Text('${item.courseTitle}\nAmount: ₹${item.amount}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.receipt_long, color: AppConstants.primaryColor),
                  tooltip: 'View Proof',
                  onPressed: () => _showProofDialog(item),
                ),
                if (isPending) ...[
                  IconButton(
                    icon: const Icon(Icons.check, color: Colors.greenAccent),
                    tooltip: 'Quick Approve',
                    onPressed: () => _verifyPayment(item.id, 'VERIFIED'),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}
