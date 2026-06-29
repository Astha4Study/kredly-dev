import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Plus, Check, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { cn } from '@/lib/utils';

interface CreditTopupProps {
  kredit: number;
}

interface TopupPackage {
  credits: number;
  price: string;
  priceNumeric: number;
  pricePerCredit: string;
  bonus?: number;
  popular?: boolean;
}

const topupPackages: TopupPackage[] = [
  {
    credits: 300,
    price: 'Rp 140.000',
    priceNumeric: 140000,
    pricePerCredit: 'Rp 467/kredit',
    bonus: 10,
    popular: true,
  },
  {
    credits: 500,
    price: 'Rp 225.000',
    priceNumeric: 225000,
    pricePerCredit: 'Rp 450/kredit',
    bonus: 25,
  },
  {
    credits: 1000,
    price: 'Rp 400.000',
    priceNumeric: 400000,
    pricePerCredit: 'Rp 400/kredit',
    bonus: 100,
  },
];

export default function CreditTopup({ kredit }: CreditTopupProps) {
  const navigate = useNavigate();
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TopupPackage>(
    topupPackages.find((pkg) => pkg.popular) ?? topupPackages[0],
  );

  const totalCredits = selectedPackage.credits + (selectedPackage.bonus ?? 0);

  return (
    <>
      <DropdownMenuContent align="end" className="w-56 rounded-none">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Kredit Anda</p>
            <p className="text-xs leading-none text-muted-foreground">
              Sisa kredit yang tersedia
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{kredit}</span>
            <span className="text-sm text-muted-foreground">Kredit</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setIsTopupOpen(true)}
          className="cursor-pointer rounded-none"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Tambah Kredit</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-none gap-0 [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Top Up Kredit</DialogTitle>
            <DialogDescription>
              Pilih paket kredit yang sesuai dengan kebutuhan Anda.
            </DialogDescription>
          </DialogHeader>

          {/* Header — saldo & info */}
          <div className="flex items-stretch border-b">
            <div className="flex-1 px-7 py-6">
              <p className="text-[11px] tracking-widest text-muted-foreground uppercase mb-1.5">
                Saldo saat ini
              </p>
              <p className="text-[38px] font-medium leading-none">{kredit}</p>
              <p className="text-sm text-muted-foreground mt-1">
                kredit tersedia
              </p>
            </div>
            <div className="border-l px-7 py-6 flex flex-col justify-center gap-1.5">
              {[
                '1 kredit = 1 asesmen',
                '5 kredit = sertifikat blockchain',
                'Kredit tidak kedaluwarsa',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Package grid */}
          <div className="px-7 pt-5">
            <p className="text-[11px] tracking-widest text-muted-foreground uppercase mb-3.5">
              Pilih paket
            </p>
            <div className="grid grid-cols-3 border border-border">
              {topupPackages.map((pkg, i) => (
                <button
                  key={pkg.credits}
                  onClick={() => setSelectedPackage(pkg)}
                  className={cn(
                    'relative text-left px-3.5 py-4 transition-colors cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    i < topupPackages.length - 1 && 'border-r border-border',
                    selectedPackage.credits === pkg.credits
                      ? 'bg-white dark:bg-background'
                      : 'bg-zinc-100/50 hover:bg-zinc-100',
                  )}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 inset-x-0 bg-foreground text-background text-[10px] text-center py-0.5 tracking-widest">
                      POPULER
                    </div>
                  )}
                  <p
                    className={cn(
                      'text-[22px] font-medium leading-none',
                      pkg.popular && 'mt-5',
                    )}
                  >
                    {pkg.credits}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 mb-3.5">
                    kredit
                    {pkg.bonus && (
                      <>
                        {' '}
                        +{' '}
                        <span className="font-medium text-foreground">
                          {pkg.bonus} bonus
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-[13px] font-medium">{pkg.price}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {pkg.pricePerCredit}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Summary row */}
          <div className="px-7 py-5 border-t mt-5 flex items-start justify-between">
            <div>
              <p className="text-[11px] tracking-widest text-muted-foreground uppercase mb-1.5">
                Ringkasan
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-medium leading-none">
                  {totalCredits}
                </span>
                <span className="text-sm text-muted-foreground">
                  kredit akan ditambahkan
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedPackage.credits} kredit
                {selectedPackage.bonus
                  ? ` + ${selectedPackage.bonus} bonus`
                  : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Total bayar</p>
              <p className="text-[22px] font-medium">{selectedPackage.price}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-7 pb-6 flex gap-2.5">
            <Button
              size="lg"
              variant="default"
              className="flex-1"
              onClick={() => {
                setIsTopupOpen(false);
                navigate({
                  to: '/app/checkout',
                  search: {
                    credits: selectedPackage.credits,
                  },
                });
              }}
            >
              Bayar sekarang
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsTopupOpen(false)}
            >
              Batal
            </Button>
          </div>

          {/* Footer */}
          <div className="border-t px-7 py-3 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              Pembayaran aman melalui Midtrans · Kredit masuk otomatis setelah
              pembayaran berhasil
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
