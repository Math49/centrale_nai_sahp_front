'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { usePanneauDossier } from '@/api/dossiers';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';

export default function PageDossier() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dossier = usePanneauDossier(id);

  useEffect(() => {
    if (dossier.data) {
      router.replace(
        `/entites/${dossier.data.entitePivotId}?dossier=${dossier.data.id}`,
      );
    }
  }, [dossier.data, router]);

  if (dossier.isError) {
    return (
      <EtatVide
        titre="Ce dossier n’existe pas."
        explication="Il a peut-être été fermé, ou vous n’y avez pas accès — la centrale ne fait pas la différence, à dessein."
        action={
          <Link className={controles.bouton} href="/dossiers">
            Revenir à la liste
          </Link>
        }
      />
    );
  }

  return <p className={controles.remarque}>Ouverture du dossier…</p>;
}
