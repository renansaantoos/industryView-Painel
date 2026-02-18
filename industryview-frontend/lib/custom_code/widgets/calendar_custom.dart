// Automatic FlutterFlow imports
import '/backend/schema/structs/index.dart';
import '/actions/actions.dart' as action_blocks;
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom widgets
import '/custom_code/actions/index.dart'; // Imports custom actions
import '/flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom widget code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import 'package:calendar_date_picker2/calendar_date_picker2.dart';

class CalendarCustom extends StatefulWidget {
  const CalendarCustom({
    super.key,
    this.width,
    this.height,
    this.paramDate,
  });

  final double? width;
  final double? height;
  final List<DateTime>? paramDate;

  @override
  State<CalendarCustom> createState() => _CalendarCustomState();
}

class _CalendarCustomState extends State<CalendarCustom> {
  List<DateTime?> selectedDates = [];
  final Color primaryColor = const Color(0xFF105DFB);

  @override
  void initState() {
    super.initState();
    selectedDates = widget.paramDate ?? [];
  }

  @override
  Widget build(BuildContext context) {
    final config = CalendarDatePicker2Config(
      calendarType: CalendarDatePicker2Type.multi,
      firstDate: DateTime(2020, 1, 1),
      lastDate: DateTime(2025, 12, 31),
      selectedDayHighlightColor: primaryColor,
      dayBuilder: ({
        required DateTime date,
        BoxDecoration? decoration,
        bool? isDisabled,
        bool? isSelected,
        bool? isToday,
        TextStyle? textStyle,
      }) {
        final range = selectedDates.whereType<DateTime>().toList();
        range.sort();

        bool isStart = range.isNotEmpty && date.isAtSameMomentAs(range.first);
        bool isEnd = range.length > 1 && date.isAtSameMomentAs(range.last);
        bool isBetween = range.length == 2 &&
            date.isAfter(range.first) &&
            date.isBefore(range.last);

        if (isStart) {
          return Container(
            decoration: BoxDecoration(
              color: primaryColor,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(30),
                bottomLeft: Radius.circular(30),
              ),
            ),
            alignment: Alignment.center,
            child: Text(
              '${date.day}',
              style: const TextStyle(
                  color: Colors.white, fontWeight: FontWeight.bold),
            ),
          );
        } else if (isEnd) {
          return Container(
            decoration: BoxDecoration(
              color: primaryColor,
              borderRadius: const BorderRadius.only(
                topRight: Radius.circular(30),
                bottomRight: Radius.circular(30),
              ),
            ),
            alignment: Alignment.center,
            child: Text(
              '${date.day}',
              style: const TextStyle(
                  color: Colors.white, fontWeight: FontWeight.bold),
            ),
          );
        } else if (isBetween) {
          return Container(
            decoration: BoxDecoration(
              color: primaryColor.withOpacity(0.2),
              borderRadius: BorderRadius.zero,
            ),
            alignment: Alignment.center,
            child: Text(
              '${date.day}',
              style: const TextStyle(color: Colors.black),
            ),
          );
        } else {
          return null;
        }
      },
    );

    return SizedBox(
      width: widget.width ?? double.infinity,
      height: widget.height ?? 400,
      child: CalendarDatePicker2(
        config: config,
        value: selectedDates,
        onValueChanged: (dates) {
          setState(() {
            final newDates = dates.whereType<DateTime>().toList();

            if (newDates.length <= 2) {
              selectedDates = newDates;
            } else {
              final last = newDates.last;
              final prev = newDates.sublist(0, newDates.length - 1);

              final isEarlier = prev.every((d) => last.isBefore(d));
              final isLater = prev.every((d) => last.isAfter(d));

              if (isEarlier || isLater) {
                selectedDates = [last];
              } else {
                selectedDates = [prev.last, last];
              }
            }

            FFAppState().update(() {
              FFAppState().datesPicked =
                  selectedDates.whereType<DateTime>().toList();
            });
          });
        },
      ),
    );
  }
}
