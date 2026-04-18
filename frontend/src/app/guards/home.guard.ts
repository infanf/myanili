import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MalService } from '@services/mal.service';
import { filter, firstValueFrom } from 'rxjs';

export const homeGuard: CanActivateFn = async () => {
  const malService = inject(MalService);
  const router = inject(Router);
  const loggedIn = await firstValueFrom(
    malService.loggedIn.pipe(filter(v => v !== '***loading***')),
  );
  if (loggedIn) return router.createUrlTree(['/anime/watchlist']);
  return router.createUrlTree(['/search/anime']);
};
