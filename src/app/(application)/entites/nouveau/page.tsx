'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { usePanneauDossier } from '@/api/dossiers';
import { useReferentiel } from '@/api/referentiel';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { IconeFontAwesome } from '@/composants/icone-fontawesome';
import type { SourceActive } from '@/composants/formulaire/bandeau-source';
import {
  MoteurFormulaire,
  useRegistreCascade,
  type EntiteEnregistree,
} from '@/composants/formulaire/moteur-formulaire';
import { EnteteZone } from '@/composants/zone';

export default function PageNouvelleEntite() {
  return (
    <Suspense fallback={<p className={controles.remarque}>Chargement…</p>}>
      <Saisie />
    </Suspense>
  );
}

function Saisie() {
  const parametres = useSearchParams();
  const router = useRouter();
  const referentiel = useReferentiel();

  const typeEntiteId = parametres.get('type');
  const dossierId = parametres.get('dossier');

  const dossier = usePanneauDossier(dossierId);

  const [source, definirSource] = useState<SourceActive>({
    source: '',
    fiabilite: 4,
    dateConstatation: new Date().toISOString().slice(0, 10),
  });

  const [enregistrees, definirEnregistrees] = useState<EntiteEnregistree[]>([]);

  // Le registre vit ici, à la racine de la cascade : abandonner une branche doit
  // pouvoir retirer tout ce qu'elle a persisté, quel qu'en soit le niveau.
  const registre = useRegistreCascade();

  const types = referentiel.data?.typesEntites ?? [];
  const type = types.find((candidat) => candidat.id === typeEntiteId);

  const lienVers = (id: string) =>
    dossierId
      ? `/entites/nouveau?type=${id}&dossier=${dossierId}`
      : `/entites/nouveau?type=${id}`;

  // Sans type désigné, on ne devine pas : c'est lui qui décrit les champs.
  if (!typeEntiteId || (referentiel.isSuccess && !type)) {
    return (
      <>
        <EnteteZone
          titre="Nouvelle fiche"
          sousTitre={
            dossier.data
              ? `La saisie sera rattachée au dossier ${dossier.data.nom}.`
              : undefined
          }
        />

        {types.length === 0 ? (
          <EtatVide
            titre="Aucun type de donnée n’est configuré."
            explication="Le modèle se règle en administration."
            action={
              <Link className={controles.bouton} href="/entites">
                Revenir à l’annuaire
              </Link>
            }
          />
        ) : (
          <EtatVide
            titre="Que décrit-on ?"
            explication="La saisie part toujours d’un type : c’est lui qui décrit les champs à remplir."
            action={
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {types.map((candidat) => (
                  <Link
                    key={candidat.id}
                    className={controles.boutonDiscret}
                    href={lienVers(candidat.id)}
                    style={{ gap: 6 }}
                  >
                    <IconeFontAwesome valeur={candidat.icone} taille={13} />
                    {candidat.libelle}
                  </Link>
                ))}
              </div>
            }
          />
        )}
      </>
    );
  }

  return (
    <>
      <EnteteZone
        titre={`Nouvelle fiche — ${type?.libelle ?? '…'}`}
        sousTitre={
          dossier.data
            ? `Saisie depuis le dossier ${dossier.data.nom} : la fiche entrera dans son suivi, et ses faits en hériteront la visibilité.`
            : 'Les liens se construisent seuls : remplir un champ relationnel suffit à poser l’arête.'
        }
      />

      {enregistrees.length > 0 && (
        <p className={controles.remarque} style={{ marginBottom: 14 }}>
          Enregistré :{' '}
          {enregistrees.map((entite) => entite.libelle).join(' · ')}
        </p>
      )}

      <MoteurFormulaire
        // Remonter la clé force un formulaire vierge après chaque
        // enregistrement, sans traîner l'état de la saisie précédente.
        key={`${typeEntiteId}-${enregistrees.length}`}
        typeEntiteId={typeEntiteId}
        dossierId={dossierId ?? undefined}
        source={source}
        onSourceChange={definirSource}
        registre={registre}
        onEnregistre={(entite) =>
          definirEnregistrees((liste) => [...liste, entite])
        }
        onAnnule={() =>
          router.push(dossierId ? `/dossiers/${dossierId}` : '/entites')
        }
      />
    </>
  );
}
