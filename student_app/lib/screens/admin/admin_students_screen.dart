import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../providers/admin_provider.dart';
import '../../models/admin_model.dart';

class AdminStudentsScreen extends StatefulWidget {
  const AdminStudentsScreen({super.key});

  @override
  State<AdminStudentsScreen> createState() => _AdminStudentsScreenState();
}

class _AdminStudentsScreenState extends State<AdminStudentsScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().fetchStudents();
      context.read<AdminProvider>().fetchCourses();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showCreateStudentDialog() {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final passwordController = TextEditingController();
    final phoneController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Add New Student', style: TextStyle(color: Colors.white)),
        content: SingleChildScrollView(
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _dialogTextField(nameController, 'Full Name', Icons.person),
                const SizedBox(height: 12),
                _dialogTextField(emailController, 'Email Address', Icons.email, keyboardType: TextInputType.emailAddress),
                const SizedBox(height: 12),
                _dialogTextField(passwordController, 'Password', Icons.lock, obscureText: true),
                const SizedBox(height: 12),
                _dialogTextField(phoneController, 'Phone Number', Icons.phone, keyboardType: TextInputType.phone),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppConstants.primaryColor),
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                final provider = context.read<AdminProvider>();
                try {
                  await provider.createStudent(
                    nameController.text.trim(),
                    emailController.text.trim(),
                    passwordController.text,
                    phoneController.text.trim(),
                  );
                  if (ctx.mounted) Navigator.pop(ctx);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Student created successfully!'), backgroundColor: Colors.green),
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
            },
            child: const Text('Create Student', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showAssignCourseDialog(AdminStudent student) {
    final courses = context.read<AdminProvider>().courses;
    final selectedCourseIds = <int>{};

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: Text('Assign Courses to ${student.name}', style: const TextStyle(color: Colors.white, fontSize: 16)),
          content: SizedBox(
            width: double.maxFinite,
            height: 300,
            child: courses.isEmpty
                ? const Center(child: Text('No courses available', style: TextStyle(color: Colors.grey)))
                : ListView.builder(
                    itemCount: courses.length,
                    itemBuilder: (ctx, i) {
                      final c = courses[i];
                      final isSelected = selectedCourseIds.contains(c.id);
                      return CheckboxListTile(
                        activeColor: AppConstants.primaryColor,
                        title: Text(c.title, style: const TextStyle(color: Colors.white, fontSize: 14)),
                        subtitle: Text('₹${c.price}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                        value: isSelected,
                        onChanged: (val) {
                          setDialogState(() {
                            if (val == true) {
                              selectedCourseIds.add(c.id);
                            } else {
                              selectedCourseIds.remove(c.id);
                            }
                          });
                        },
                      );
                    },
                  ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppConstants.primaryColor),
              onPressed: selectedCourseIds.isEmpty
                  ? null
                  : () async {
                      try {
                        await context.read<AdminProvider>().assignCourses(student.id, selectedCourseIds.toList());
                        if (ctx.mounted) Navigator.pop(ctx);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Courses assigned successfully!'), backgroundColor: Colors.green),
                          );
                        }
                      } catch (e) {
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                          );
                        }
                      }
                    },
              child: const Text('Assign Selected', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _dialogTextField(
    TextEditingController controller,
    String label,
    IconData icon, {
    bool obscureText = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.grey),
        prefixIcon: Icon(icon, color: AppConstants.primaryColor, size: 20),
        filled: true,
        fillColor: const Color(0xFF0F172A),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
      ),
      validator: (v) => v == null || v.isEmpty ? 'Required field' : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AdminProvider>();
    final students = provider.students.where((s) {
      final q = _searchQuery.toLowerCase();
      return s.name.toLowerCase().contains(q) || s.email.toLowerCase().contains(q);
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Manage Students', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppConstants.primaryColor,
        onPressed: _showCreateStudentDialog,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Student', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Search Bar
            TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search by name or email...',
                hintStyle: const TextStyle(color: Colors.grey),
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: provider.isLoading && provider.students.isEmpty
                  ? const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor))
                  : students.isEmpty
                      ? const Center(child: Text('No students found', style: TextStyle(color: Colors.grey)))
                      : ListView.builder(
                          itemCount: students.length,
                          itemBuilder: (context, index) {
                            final s = students[index];
                            return Card(
                              color: const Color(0xFF1E293B),
                              margin: const EdgeInsets.only(bottom: 10),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: s.isActive ? Colors.green.withAlpha(30) : Colors.red.withAlpha(30),
                                  child: Icon(
                                    s.isActive ? Icons.person : Icons.person_off,
                                    color: s.isActive ? Colors.greenAccent : Colors.redAccent,
                                  ),
                                ),
                                title: Text(s.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                subtitle: Text(
                                  '${s.email}${s.phone != null ? " • ${s.phone}" : ""}',
                                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                                ),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.add_task_rounded, color: AppConstants.primaryColor),
                                      tooltip: 'Assign Courses',
                                      onPressed: () => _showAssignCourseDialog(s),
                                    ),
                                    Switch(
                                      value: s.isActive,
                                      activeColor: Colors.greenAccent,
                                      inactiveThumbColor: Colors.redAccent,
                                      onChanged: (val) async {
                                        try {
                                          await provider.toggleStudentStatus(s.id);
                                        } catch (e) {
                                          if (context.mounted) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                                            );
                                          }
                                        }
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
