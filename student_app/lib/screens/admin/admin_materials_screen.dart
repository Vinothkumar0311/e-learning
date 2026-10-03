import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';

class AdminMaterialsScreen extends StatefulWidget {
  const AdminMaterialsScreen({super.key});

  @override
  State<AdminMaterialsScreen> createState() => _AdminMaterialsScreenState();
}

class _AdminMaterialsScreenState extends State<AdminMaterialsScreen> {
  final List<Map<String, dynamic>> _materials = [
    {
      'id': 1,
      'title': 'NEET 2025 Physics Formula Sheet PDF',
      'course': 'NEET 2025 Physics',
      'type': 'PDF Document',
      'size': '2.4 MB',
      'date': '2026-09-08'
    },
    {
      'id': 2,
      'title': 'Organic Chemistry Reaction Mechanisms Notes',
      'course': 'NEET Chemistry',
      'type': 'PDF Document',
      'size': '4.1 MB',
      'date': '2026-09-07'
    }
  ];

  void _showAddMaterialDialog() {
    final titleCtrl = TextEditingController();
    final urlCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Row(
          children: [
            Icon(Icons.picture_as_pdf_rounded, color: AppConstants.primaryColor, size: 22),
            SizedBox(width: 8),
            Text('Upload Study Material', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Material Title *', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            TextField(
              controller: titleCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'e.g. Chapter 1 Notes PDF',
                hintStyle: const TextStyle(color: Colors.white30),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.white10)),
              ),
            ),
            const SizedBox(height: 12),
            const Text('File / PDF URL *', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            TextField(
              controller: urlCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'http://.../notes.pdf',
                hintStyle: const TextStyle(color: Colors.white30),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.white10)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppConstants.primaryColor),
            onPressed: () {
              if (titleCtrl.text.trim().isEmpty) return;
              setState(() {
                _materials.insert(0, {
                  'id': DateTime.now().millisecondsSinceEpoch,
                  'title': titleCtrl.text.trim(),
                  'course': 'General Materials',
                  'type': 'PDF Document',
                  'size': '1.5 MB',
                  'date': DateTime.now().toString().split(' ').first,
                });
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Study Material uploaded successfully!'), backgroundColor: Colors.green),
              );
            },
            child: const Text('Save Material', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: const Text('Study Materials & PDFs', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(Icons.upload_file_rounded, color: Colors.white),
            onPressed: _showAddMaterialDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            ..._materials.map((mat) => Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppConstants.primaryColor.withAlpha(40),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.picture_as_pdf_rounded, color: AppConstants.primaryColor, size: 28),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(mat['title'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                            const SizedBox(height: 4),
                            Text('${mat['course']} • ${mat['size']}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                        onPressed: () {
                          setState(() {
                            _materials.removeWhere((item) => item['id'] == mat['id']);
                          });
                        },
                      ),
                    ],
                  ),
                )),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppConstants.primaryColor,
        icon: const Icon(Icons.upload_file_rounded, color: Colors.white),
        label: const Text('Upload Material', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: _showAddMaterialDialog,
      ),
    );
  }
}
