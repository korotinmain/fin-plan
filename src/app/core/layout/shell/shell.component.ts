import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppLocale } from '../../models/ui-preferences.model';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { CurrencyFacade } from '../../../features/currency/currency.facade';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, DecimalPipe, DatePipe],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly authService = inject(AuthService);
  private readonly currencyFacade = inject(CurrencyFacade);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly locale = this.i18n.locale;
  readonly rates = this.currencyFacade.rates;
  readonly isRefreshingRates = signal(false);
  readonly ratesLastFetched = signal<Date | null>(null);
  readonly ratesError = signal<string | null>(null);

  signOut(): void {
    this.authService.signOut().subscribe(() => {
      void this.router.navigate(['/auth/login']);
    });
  }

  refreshRates(): void {
    if (this.isRefreshingRates()) {
      return;
    }

    this.isRefreshingRates.set(true);
    this.ratesError.set(null);

    try {
      this.currencyFacade.fetchAndSaveRates().subscribe({
        next: () => {
          this.ratesLastFetched.set(new Date());
          this.isRefreshingRates.set(false);
        },
        error: () => {
          this.ratesError.set('currency.rates.fetchError');
          this.isRefreshingRates.set(false);
        },
      });
    } catch {
      this.ratesError.set('currency.rates.fetchError');
      this.isRefreshingRates.set(false);
    }
  }

  setLocale(locale: AppLocale): void {
    this.i18n.setLocale(locale);
  }
}
