import 'package:flutter/material.dart';

class AdminLiveClassesScreen extends StatefulWidget {
  const AdminLiveClassesScreen({super.key});

  @override
  State<AdminLiveClassesScreen> createState() => _AdminLiveClassesScreenState();
}

class _AdminLiveClassesScreenState extends State<AdminLiveClassesScreen> {
  final List<Map<String, dynamic>> _liveClasses = [
    {
      'id': 1,
      'title': 'NEET Organic Chemistry Masterclass',
      'course': 'NEET 2025 Complete Physics & Chemistry',
      'scheduled_at': '2026-09-11 10:00 AM',
      'status': 'scheduled',
      'stream_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      'id': 2,
      'title': 'Botany Genetics Problem Solving',
      'course': 'Biology Foundation Course',
      'scheduled_at': '2026-09-12 04:00 PM',
      'status': 'scheduled',
      'stream_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }
  ];

  void _showAddLiveClassDialog() {
    final titleCtrl = TextEditingController();
    final urlCtrl = TextEditingController();
    final dateCtrl = TextEditingController(text: '2026-09-12 10:00 AM');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Row(
          children: [
            Icon(Icons.live_tv_rounded, color: Colors.redAccent, size: 22),
            SizedBox(width: 8),
            Text('Schedule Live Class', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Title *', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            TextField(
              controller: titleCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'e.g. Physics Optics Live Q&A',
                hintStyle: const TextStyle(color: Colors.white30),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.white10)),
              ),
            ),
            const SizedBox(height: 12),
            const Text('Stream / YouTube URL *', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            TextField(
              controller: urlCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'https://youtube.com/watch?v=...',
                hintStyle: const TextStyle(color: Colors.white30),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.white10)),
              ),
            ),
            const SizedBox(height: 12),
            const Text('Schedule Time', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            TextField(
              controller: dateCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
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
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () {
              if (titleCtrl.text.trim().isEmpty) return;
              setState(() {
                _liveClasses.insert(0, {
                  'id': DateTime.now().millisecondsSinceEpoch,
                  'title': titleCtrl.text.trim(),
                  'course': 'All Courses',
                  'scheduled_at': dateCtrl.text,
                  'status': 'scheduled',
                  'stream_url': urlCtrl.text.trim(),
                });
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Live Class scheduled successfully!'), backgroundColor: Colors.green),
              );
            },
            child: const Text('Schedule Class', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
        title: const Text('Live Classes Management', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: _showAddLiveClassDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            ..._liveClasses.map((lc) {
              final isLive = lc['status'] == 'live';
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isLive ? Colors.redAccent : Colors.white10),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isLive ? Colors.redAccent.withAlpha(50) : Colors.blueAccent.withAlpha(50),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              Icon(isLive ? Icons.sensors : Icons.schedule, color: isLive ? Colors.redAccent : Colors.blueAccent, size: 14),
                              const SizedBox(width: 4),
                              Text(
                                isLive ? 'LIVE NOW' : 'SCHEDULED',
                                style: TextStyle(
                                  color: isLive ? Colors.redAccent : Colors.blueAccent,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(lc['scheduled_at'], style: const TextStyle(color: Colors.grey, fontSize: 12)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(lc['title'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 4),
                    Text('Course: ${lc['course']}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    const Divider(color: Colors.white10, height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isLive ? Colors.grey : Colors.redAccent,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          ),
                          icon: Icon(isLive ? Icons.stop : Icons.play_arrow, color: Colors.white, size: 16),
                          label: Text(isLive ? 'End Stream' : 'Go Live Now', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                          onPressed: () {
                            setState(() {
                              lc['status'] = isLive ? 'ended' : 'live';
                            });
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 18),
                          onPressed: () {
                            setState(() {
                              _liveClasses.removeWhere((item) => item['id'] == lc['id']);
                            });
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: Colors.redAccent,
        icon: const Icon(Icons.video_call_rounded, color: Colors.white),
        label: const Text('Schedule Live Class', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: _showAddLiveClassDialog,
      ),
    );
  }
}
