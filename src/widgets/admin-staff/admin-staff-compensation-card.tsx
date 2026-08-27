'use client';

import type { EmploymentType } from '@/entities/staff';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

interface AdminStaffCompensationCardProps {
  employmentType: EmploymentType;
  staffSharePercent: string;
  rentPercent: string;
  rentFixed: string;
  onEmploymentTypeChange: (value: EmploymentType) => void;
  onStaffSharePercentChange: (value: string) => void;
  onRentPercentChange: (value: string) => void;
  onRentFixedChange: (value: string) => void;
}

export function AdminStaffCompensationCard({
  employmentType,
  staffSharePercent,
  rentPercent,
  rentFixed,
  onEmploymentTypeChange,
  onStaffSharePercentChange,
  onRentPercentChange,
  onRentFixedChange,
}: AdminStaffCompensationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compensation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Employment type</Label>
          <Select
            value={employmentType}
            onValueChange={(value) =>
              onEmploymentTypeChange(value as EmploymentType)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salaried">Salaried</SelectItem>
              <SelectItem value="chair_rent">Chair rent</SelectItem>
              <SelectItem value="commission">Commission</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {employmentType !== 'salaried' ? (
          <div>
            <Label htmlFor="staffShare">Staff share %</Label>
            <Input
              id="staffShare"
              type="number"
              min={0}
              max={100}
              value={staffSharePercent}
              onChange={(e) => onStaffSharePercentChange(e.target.value)}
            />
          </div>
        ) : null}
        {employmentType === 'chair_rent' ? (
          <>
            <div>
              <Label htmlFor="rentPercent">Rent % (monthly)</Label>
              <Input
                id="rentPercent"
                type="number"
                min={0}
                max={100}
                value={rentPercent}
                onChange={(e) => onRentPercentChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rentFixed">Rent fixed (MNT)</Label>
              <Input
                id="rentFixed"
                type="number"
                min={0}
                value={rentFixed}
                onChange={(e) => onRentFixedChange(e.target.value)}
              />
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
