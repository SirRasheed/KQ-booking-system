'use client';

import React, { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Crown, Armchair, User, Lock } from 'lucide-react';

interface Seat {
  id: string;
  seatNumber: string;
  row: number;
  column: string;
  travelClass: string;
  status: string;
}

interface SeatMapProps {
  seats: Seat[];
  travelClass: string;
  selectedSeats: string[];
  onSeatSelect: (seatNumber: string) => void;
  maxSelectable?: number;
}

// Layout configurations for each class
const CLASS_LAYOUTS: Record<string, {
  columns: string[];
  aisleAfterColumns: string[];
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  EXECUTIVE: {
    columns: ['A', 'C', 'D', 'F'],
    aisleAfterColumns: ['C'],
    label: 'Executive Class',
    icon: <Crown className="h-4 w-4" />,
    color: 'amber',
  },
  MIDDLE: {
    columns: ['A', 'B', 'C', 'D', 'E', 'F'],
    aisleAfterColumns: ['C'],
    label: 'Premium Economy',
    icon: <Armchair className="h-4 w-4" />,
    color: 'blue',
  },
  LOW: {
    columns: ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'J', 'K'],
    aisleAfterColumns: ['C', 'F'],
    label: 'Economy Class',
    icon: <User className="h-4 w-4" />,
    color: 'emerald',
  },
};

export function SeatMap({ seats, travelClass, selectedSeats, onSeatSelect, maxSelectable = 10 }: SeatMapProps) {
  const layout = CLASS_LAYOUTS[travelClass] || CLASS_LAYOUTS.LOW;

  // Group seats by row
  const seatsByRow = useMemo(() => {
    const classSeats = seats.filter(s => s.travelClass === travelClass);
    const grouped: Record<number, Record<string, Seat>> = {};
    
    for (const seat of classSeats) {
      if (!grouped[seat.row]) {
        grouped[seat.row] = {};
      }
      grouped[seat.row][seat.column] = seat;
    }
    
    return grouped;
  }, [seats, travelClass]);

  const rows = useMemo(() => {
    return Object.keys(seatsByRow).map(Number).sort((a, b) => a - b);
  }, [seatsByRow]);

  const getSeatStatus = (seat: Seat | undefined) => {
    if (!seat) return 'missing'; // No seat exists in this position
    if (seat.status === 'OCCUPIED') return 'occupied';
    if (selectedSeats.includes(seat.seatNumber)) return 'selected';
    return 'available';
  };

  const handleSeatClick = (seat: Seat | undefined) => {
    if (!seat || seat.status === 'OCCUPIED') return;
    if (selectedSeats.includes(seat.seatNumber)) {
      onSeatSelect(seat.seatNumber); // Deselect
    } else if (selectedSeats.length < maxSelectable) {
      onSeatSelect(seat.seatNumber); // Select
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-full">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
              <span className="text-[10px] text-gray-400">—</span>
            </div>
            <span className="text-xs text-gray-500">No seat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-white border-2 border-gray-300 hover:border-green-400" />
            <span className="text-xs text-gray-500">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-red-500/90 border-2 border-red-600 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">✕</span>
            </div>
            <span className="text-xs text-gray-500">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-green-500 border-2 border-green-600 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">✓</span>
            </div>
            <span className="text-xs text-gray-500">Selected</span>
          </div>
          {travelClass === 'EXECUTIVE' && (
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-amber-600 font-medium">VIP / Business Class</span>
            </div>
          )}
        </div>

        {/* Plane nose */}
        <div className="flex justify-center mb-1">
          <div className="w-32 h-6 bg-gradient-to-b from-gray-200 to-gray-100 rounded-t-full border border-gray-200" />
        </div>

        {/* Seat grid */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
          {/* Column headers */}
          <div className="flex items-center bg-gray-100 border-b border-gray-200 px-2 py-2">
            <div className="w-8 text-center text-xs font-medium text-gray-400">Row</div>
            {layout.columns.map((col, idx) => (
              <React.Fragment key={col}>
                <div className="flex-1 flex justify-center">
                  <div className="w-9 h-6 flex items-center justify-center text-xs font-bold text-gray-600">
                    {col}
                  </div>
                </div>
                {layout.aisleAfterColumns.includes(col) && (
                  <div className="w-5" /> // Aisle gap
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Seat rows */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {rows.map((rowNum) => {
              const rowSeats = seatsByRow[rowNum];
              return (
                <div
                  key={rowNum}
                  className="flex items-center border-b border-gray-100 px-2 py-1.5 hover:bg-gray-50/80 transition-colors"
                >
                  {/* Row number */}
                  <div className="w-8 text-center text-xs font-semibold text-gray-400">
                    {rowNum}
                  </div>

                  {/* Seats */}
                  {layout.columns.map((col, idx) => {
                    const seat = rowSeats[col];
                    const status = getSeatStatus(seat);
                    const isSelected = status === 'selected';
                    const isOccupied = status === 'occupied';
                    const isMissing = status === 'missing';
                    const isVip = travelClass === 'EXECUTIVE';

                    return (
                      <React.Fragment key={col}>
                        <div className="flex-1 flex justify-center">
                          {isMissing ? (
                            <div className="w-9 h-9 rounded-md border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                              <span className="text-[10px] text-gray-300">—</span>
                            </div>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  disabled={isOccupied}
                                  onClick={() => handleSeatClick(seat)}
                                  className={`
                                    w-9 h-9 rounded-md text-xs font-bold transition-all duration-150
                                    flex items-center justify-center relative
                                    ${isOccupied
                                      ? isVip
                                        ? 'bg-amber-100 border-2 border-amber-300 cursor-not-allowed'
                                        : 'bg-red-500/90 border-2 border-red-600 cursor-not-allowed text-white'
                                      : isSelected
                                        ? isVip
                                          ? 'bg-amber-500 border-2 border-amber-600 text-white shadow-md scale-105'
                                          : 'bg-green-500 border-2 border-green-600 text-white shadow-md scale-105'
                                        : isVip
                                          ? 'bg-amber-50 border-2 border-amber-300 hover:border-amber-500 hover:bg-amber-100 text-amber-700 cursor-pointer'
                                          : 'bg-white border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 text-gray-600 cursor-pointer'
                                    }
                                    ${!isOccupied && !isSelected ? 'active:scale-95' : ''}
                                  `}
                                  aria-label={`Seat ${seat?.seatNumber} - ${isOccupied ? 'Occupied' : isSelected ? 'Selected' : 'Available'}${isVip ? ' (VIP)' : ''}`}
                                >
                                  {isOccupied ? (
                                    isVip ? (
                                      <Crown className="h-3.5 w-3.5 text-amber-400" />
                                    ) : (
                                      <Lock className="h-3.5 w-3.5" />
                                    )
                                  ) : isSelected ? (
                                    <span className="text-[10px]">✓</span>
                                  ) : isVip ? (
                                    <Crown className="h-3 w-3 opacity-60" />
                                  ) : (
                                    <span className="text-[10px]">{col}</span>
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                <span>
                                  Seat {seat?.seatNumber}
                                  {isVip ? ' (VIP)' : ''}
                                  {' — '}
                                  {isOccupied ? 'Occupied' : isSelected ? 'Selected' : 'Available'}
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        {layout.aisleAfterColumns.includes(col) && (
                          <div className="w-5 flex items-center justify-center">
                            <div className="w-px h-6 bg-gray-200" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Plane tail */}
        <div className="flex justify-center mt-1">
          <div className="w-24 h-4 bg-gradient-to-t from-gray-200 to-gray-100 rounded-b-full border border-gray-200" />
        </div>

        {/* Selection info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Selected: <span className="text-green-600">{selectedSeats.length}</span> / {maxSelectable} seats
              </p>
              {selectedSeats.length > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Seats: {selectedSeats.sort().join(', ')}
                </p>
              )}
            </div>
            {selectedSeats.length >= maxSelectable && (
              <p className="text-xs text-amber-600 font-medium">Max seats reached</p>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
