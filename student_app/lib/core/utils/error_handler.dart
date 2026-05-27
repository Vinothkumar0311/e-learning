import 'dart:convert';
import 'package:dio/dio.dart';

class ErrorHandler {
  static String getErrorMessage(DioException e, String defaultMessage) {
    print("DEBUG ERROR: type=${e.type}, error=${e.error}, message=${e.message}, response=${e.response}");
    print("DEBUG ERROR RESPONSE DATA: ${e.response?.data}");

    final responseData = e.response?.data;
    if (responseData == null) return defaultMessage;

    if (responseData is Map) {
      return responseData['message']?.toString() ?? defaultMessage;
    } else if (responseData is String) {
      try {
        final decoded = jsonDecode(responseData);
        if (decoded is Map) {
          return decoded['message']?.toString() ?? defaultMessage;
        }
      } catch (_) {
        // If it's a HTML error page or raw text, return default or first 100 chars
        if (responseData.trim().startsWith('<')) {
          return defaultMessage;
        }
        return responseData;
      }
    }
    return defaultMessage;
  }
}
