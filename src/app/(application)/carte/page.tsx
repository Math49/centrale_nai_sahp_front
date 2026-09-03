'use client';

import { GardePermission } from '@/auth/garde-permission';
import { Plan } from './plan';

export default function PageCarte() {
  return (
    <GardePermission
      permission="carte.consulter"
      explication="La carte relève du geste « carte.consulter »."
    >
      <Plan />
    </GardePermission>
  );
}
