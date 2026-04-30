import Divider from "@/components/divider";
import { useStream } from "@/context/stream/StreamSetUp";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  Sheet,
  StreamTimeSheetContext,
  useStreamTimeSheet,
} from "../CreateSheetContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_MINUTES_AHEAD = 5;
const MAX_YEARS_AHEAD = 100;
const TIME_SLOT_INTERVAL = 30;
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getMinAllowedDate = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + MIN_MINUTES_AHEAD);
  return d;
};

const getMaxAllowedDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + MAX_YEARS_AHEAD);
  return d;
};

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

const generateTimeSlots = (selectedDate: Date) => {
  const slots: { label: string; hour: number; minute: number }[] = [];
  const minDate = getMinAllowedDate();
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += TIME_SLOT_INTERVAL) {
      if (isToday) {
        const slotDate = new Date(selectedDate);
        slotDate.setHours(h, m, 0, 0);
        if (slotDate < minDate) continue;
      }
      const period = h < 12 ? "AM" : "PM";
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const displayMin = m.toString().padStart(2, "0");
      slots.push({
        label: `${displayHour}:${displayMin} ${period}`,
        hour: h,
        minute: m,
      });
    }
  }
  return slots;
};

const formatDisplayDate = (date: Date) =>
  `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

const formatDisplayTime = (hour: number, minute: number) => {
  const period = hour < 12 ? "AM" : "PM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${minute.toString().padStart(2, "0")} ${period}`;
};

// ─── Calendar ─────────────────────────────────────────────────────────────────
const Calendar = ({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}) => {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const minDate = getMinAllowedDate();
  const maxDate = getMaxAllowedDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const canGoPrev = () => {
    const firstOfView = new Date(viewYear, viewMonth, 1);
    const firstOfMinMonth = new Date(
      minDate.getFullYear(),
      minDate.getMonth(),
      1,
    );
    return firstOfView > firstOfMinMonth;
  };

  const canGoNext = () => {
    const firstOfView = new Date(viewYear, viewMonth, 1);
    const firstOfMaxMonth = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      1,
    );
    return firstOfView < firstOfMaxMonth;
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const isDayDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day, 23, 59, 59);
    return d < minDate || d > maxDate;
  };

  const isDaySelected = (day: number) =>
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear;

  const isToday = (day: number) => {
    const t = new Date();
    return (
      t.getDate() === day &&
      t.getMonth() === viewMonth &&
      t.getFullYear() === viewYear
    );
  };

  return (
    <View style={{ width: "100%" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Pressable
          onPress={prevMonth}
          disabled={!canGoPrev()}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: canGoPrev() ? "#1f2937" : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{ color: canGoPrev() ? "#fff" : "#374151", fontSize: 16 }}
          >
            ‹
          </Text>
        </Pressable>
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <Pressable
          onPress={nextMonth}
          disabled={!canGoNext()}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: canGoNext() ? "#1f2937" : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{ color: canGoNext() ? "#fff" : "#374151", fontSize: 16 }}
          >
            ›
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        {DAYS.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: "#6B7280", fontSize: 12, fontWeight: "600" }}>
              {d}
            </Text>
          </View>
        ))}
      </View>

      {Array.from({ length: cells.length / 7 }, (_, row) => (
        <View key={row} style={{ flexDirection: "row", marginBottom: 4 }}>
          {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
            if (!day) return <View key={col} style={{ flex: 1 }} />;
            const disabled = isDayDisabled(day);
            const selected = isDaySelected(day);
            const today = isToday(day);
            return (
              <Pressable
                key={col}
                onPress={() => {
                  if (disabled) return;
                  onSelectDate(new Date(viewYear, viewMonth, day));
                }}
                style={{ flex: 1, alignItems: "center", paddingVertical: 6 }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: selected
                      ? "#4169e1"
                      : today
                        ? "#1f2937"
                        : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: today && !selected ? 1 : 0,
                    borderColor: "#4169e1",
                  }}
                >
                  <Text
                    style={{
                      color: disabled
                        ? "#374151"
                        : selected
                          ? "#fff"
                          : "#D1D5DB",
                      fontSize: 14,
                      fontWeight: selected ? "700" : "400",
                    }}
                  >
                    {day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
};

// ─── Time Picker ──────────────────────────────────────────────────────────────
const TimePicker = ({
  selectedDate,
  selectedHour,
  selectedMinute,
  onSelectTime,
}: {
  selectedDate: Date;
  selectedHour: number;
  selectedMinute: number;
  onSelectTime: (hour: number, minute: number) => void;
}) => {
  const slots = generateTimeSlots(selectedDate);
  const flatRef = useRef<any>(null);

  const selectedIndex = slots.findIndex(
    (s) => s.hour === selectedHour && s.minute === selectedMinute,
  );

  useEffect(() => {
    if (selectedIndex >= 0 && flatRef.current) {
      setTimeout(() => {
        flatRef.current?.scrollToIndex({
          index: selectedIndex,
          animated: true,
          viewPosition: 0.3,
        });
      }, 100);
    }
  }, [selectedIndex]);

  if (slots.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#6B7280", fontSize: 14 }}>
          No available times for this date
        </Text>
      </View>
    );
  }

  return (
    <BottomSheetScrollView showsVerticalScrollIndicator={false} bounces={false}>
      {slots.map((item, i) => {
        const isSelected =
          item.hour === selectedHour && item.minute === selectedMinute;
        return (
          <Pressable
            key={i}
            onPress={() => onSelectTime(item.hour, item.minute)}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 10,
              marginVertical: 2,
              backgroundColor: isSelected ? "#1f2937" : "transparent",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: isSelected ? "#fff" : "#9CA3AF",
                fontSize: 15,
                fontWeight: isSelected ? "700" : "400",
                letterSpacing: 0.5,
              }}
            >
              {item.label.split(" ")[0]}
            </Text>
            <Text
              style={{
                color: isSelected ? "#4169e1" : "#6B7280",
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {item.label.split(" ")[1]}
            </Text>
          </Pressable>
        );
      })}
    </BottomSheetScrollView>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ScheduleTime = () => {
  const { ref: sheetRef } = useStreamTimeSheet();
  const { setScheduledTime } = useStream();

  const minDate = getMinAllowedDate();
  const [selectedDate, setSelectedDate] = useState<Date>(minDate);
  const [selectedHour, setSelectedHour] = useState<number>(minDate.getHours());
  const [selectedMinute, setSelectedMinute] = useState<number>(
    (Math.ceil(minDate.getMinutes() / TIME_SLOT_INTERVAL) *
      TIME_SLOT_INTERVAL) %
      60,
  );
  const [activeTab, setActiveTab] = useState<"date" | "time">("date");

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    const slots = generateTimeSlots(date);
    if (slots.length > 0) {
      setSelectedHour(slots[0].hour);
      setSelectedMinute(slots[0].minute);
    }
    setActiveTab("time");
  };

  const handleApply = () => {
    const finalDate = new Date(selectedDate);
    finalDate.setHours(selectedHour, selectedMinute, 0, 0);
    setScheduledTime?.(finalDate.toISOString());
    console.log("Scheduled Time:", finalDate.toISOString());
    sheetRef.current?.collapse();
  };

  return (
    <Sheet context={StreamTimeSheetContext} snapPoints={[0.000001, 580]}>
      <View style={{ flex: 1, backgroundColor: "#111827", padding: 16 }}>
        <View
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(128,128,128,0.6)",
            alignSelf: "center",
            marginBottom: 12,
          }}
        />

        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>
            Set Stream Time
          </Text>
        </View>

        {/* Date / Time tab pills */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          <Pressable
            onPress={() => setActiveTab("date")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: activeTab === "date" ? "#1f2937" : "#161d29",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1.5,
              borderColor: activeTab === "date" ? "#4169e1" : "transparent",
            }}
          >
            <Text style={{ fontSize: 16 }}></Text>
            <View>
              <Text style={{ color: "#6B7280", fontSize: 11 }}>Date</Text>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                {formatDisplayDate(selectedDate)}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("time")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: activeTab === "time" ? "#1f2937" : "#161d29",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1.5,
              borderColor: activeTab === "time" ? "#4169e1" : "transparent",
            }}
          >
            <Text style={{ fontSize: 16 }}></Text>
            <View>
              <Text style={{ color: "#6B7280", fontSize: 11 }}>Time</Text>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                {formatDisplayTime(selectedHour, selectedMinute)}
              </Text>
            </View>
          </Pressable>
        </View>

        <Divider gap={0} value={370} />

        <View style={{ flex: 1, marginTop: 12 }}>
          {activeTab === "date" ? (
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
          ) : (
            <TimePicker
              selectedDate={selectedDate}
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              onSelectTime={(h, m) => {
                setSelectedHour(h);
                setSelectedMinute(m);
              }}
            />
          )}
        </View>

        <Pressable
          onPress={handleApply}
          style={{
            height: 56,
            backgroundColor: "#4169e1",
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            Apply
          </Text>
        </Pressable>
      </View>
    </Sheet>
  );
};

export default ScheduleTime;
