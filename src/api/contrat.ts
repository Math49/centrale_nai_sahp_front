export interface paths {
  '/journal/audit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['JournalController_audit'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/journal/consultations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['JournalController_consultations'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/journal/orphelines': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['JournalController_orphelines'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/login': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['AuthController_connecter'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/moi': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['AuthController_moi'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/mot-de-passe': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['AuthController_changerMotDePasse'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/deconnexion': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['AuthController_deconnecter'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/agents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['AgentsController_lister'];
    put?: never;

    post: operations['AgentsController_creer'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/agents/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['AgentsController_lire'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;

    patch: operations['AgentsController_modifier'];
    trace?: never;
  };
  '/agents/{id}/mot-de-passe': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['AgentsController_reinitialiserMotDePasse'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/agents/{id}/anonymiser': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['AgentsController_anonymiser'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/roles': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['RolesController_lister'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/roles/catalogue-permissions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['RolesController_catalogue'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/roles/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;

    patch: operations['RolesController_modifier'];
    trace?: never;
  };
  '/referentiel': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['ReferentielController_catalogue'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/referentiel/types-entites': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['ReferentielController_creerTypeEntite'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/referentiel/types-entites/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;

    delete: operations['ReferentielController_supprimerTypeEntite'];
    options?: never;
    head?: never;
    patch: operations['ReferentielController_modifierTypeEntite'];
    trace?: never;
  };
  '/referentiel/types-entites/ordre': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['ReferentielController_ordonnerTypesEntites'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/referentiel/types-entites/apercu-gabarit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['ReferentielController_apercuGabarit'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/referentiel/champs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['ReferentielController_creerChamp'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/referentiel/champs/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: operations['ReferentielController_supprimerChamp'];
    options?: never;
    head?: never;
    patch: operations['ReferentielController_modifierChamp'];
    trace?: never;
  };
  '/referentiel/types-entites/{id}/champs/ordre': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['ReferentielController_ordonnerChamps'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/referentiel/types-liens': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['ReferentielController_creerTypeLien'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/referentiel/types-liens/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: operations['ReferentielController_supprimerTypeLien'];
    options?: never;
    head?: never;
    patch: operations['ReferentielController_modifierTypeLien'];
    trace?: never;
  };
  '/referentiel/onglets': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['ReferentielController_creerOnglet'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/referentiel/onglets/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: operations['ReferentielController_supprimerOnglet'];
    options?: never;
    head?: never;
    patch: operations['ReferentielController_modifierOnglet'];
    trace?: never;
  };
  '/referentiel/types-entites/{id}/onglets/ordre': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['ReferentielController_ordonnerOnglets'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/referentiel/onglets/{id}/types-liens': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;

    put: operations['ReferentielController_composerOnglet'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/entites': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['EntitesController_lister'];
    put?: never;

    post: operations['EntitesController_creer'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/entites/similaires': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['EntitesController_similaires'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/entites/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['EntitesController_lire'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: operations['EntitesController_modifier'];
    trace?: never;
  };
  '/entites/{id}/historique': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['EntitesController_historique'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/entites/{id}/annuler-creation': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['EntitesController_annulerCreation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/entites/{id}/fusion': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['EntitesController_fusionner'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/entites/{id}/archiver': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['EntitesController_archiver'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/entites/{id}/desarchiver': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['EntitesController_desarchiver'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/dossiers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['DossiersController_lister'];
    put?: never;

    post: operations['DossiersController_creer'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/dossiers/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['DossiersController_panneau'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: operations['DossiersController_modifier'];
    trace?: never;
  };
  '/dossiers/{id}/suivi': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['DossiersController_suivre'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/dossiers/{id}/suivi/{entiteId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: operations['DossiersController_nePlusSuivre'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/dossiers/{id}/habilitations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['DossiersController_habiliter'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/dossiers/{id}/habilitations/{agentId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: operations['DossiersController_retirerHabilitation'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/faits': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['FaitsController_creer'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/faits/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;

    patch: operations['FaitsController_modifier'];
    trace?: never;
  };
  '/faits/{id}/infirmer': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['FaitsController_infirmer'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/entites/{id}/fichiers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['FichiersController_lister'];
    put?: never;

    post: operations['FichiersController_deposer'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/fichiers/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['FichiersController_telecharger'];
    put?: never;
    post?: never;

    delete: operations['FichiersController_supprimer'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/graphe': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['GrapheController_voisinage'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/graphe/complet': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['GrapheController_vueEntiere'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/graphe/chemin': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['GrapheController_chemin'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/graphe/positions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;

    post: operations['GrapheController_enregistrerPositions'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/accueil': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['SignauxController_accueil'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/signaux': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['SignauxController_liste'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/recherche': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['SignauxController_rechercher'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/sante': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };

    get: operations['SanteController_lire'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    EntreeAuditDto: {
      id: string;

      agentId: string | null;

      agentLibelle: string;
      action: string;
      cibleTable: string;

      cibleId: string | null;

      cibleLibelle: string | null;
      avant?: {
        [key: string]: unknown;
      };
      apres?: {
        [key: string]: unknown;
      };

      effectueLe: string;
    };
    EntreeConsultationDto: {
      id: string;

      agentId: string;
      agentLibelle: string;

      nature: 'entite' | 'dossier';

      objetId: string;
      objetLibelle: string | null;

      derogation: boolean;

      superAdmin: boolean;

      consulteLe: string;
    };
    EntiteOrphelineDto: {
      id: string;
      libelle: string;
      typeCode: string;

      creeLe: string;
      auteur: string | null;
    };
    ConnexionDto: {
      matricule: string;
      motDePasse: string;
    };
    AgentConnecteDto: {
      id: string;
      matricule: string;
      prenom: string;
      nom: string;
      roleCode: string;
      superAdmin: boolean;

      doitChangerMdp: boolean;

      permissions: string[];
    };
    JetonDto: {
      jeton: string;
      agent: components['schemas']['AgentConnecteDto'];
    };
    ChangementMotDePasseDto: {
      ancien: string;
      nouveau: string;
    };
    AgentDto: {
      id: string;

      matricule: string;

      prenom: string;

      nom: string;

      libelle: string;

      roleId: string;
      roleCode: string;
      roleLibelle: string;
      superAdmin: boolean;
      actif: boolean;
      doitChangerMdp: boolean;
      anonymise: boolean;

      anonymiseLe: string | null;

      creeLe: string;
    };
    CreationAgentDto: {
      matricule: string;

      prenom: string;

      nom: string;

      roleId: string;

      superAdmin: boolean;

      motDePasse?: string;
    };
    AgentAvecMotDePasseDto: {
      agent: components['schemas']['AgentDto'];

      motDePasseProvisoire: string | null;
    };
    ModificationAgentDto: {
      prenom?: string;
      nom?: string;

      roleId?: string;
      actif?: boolean;
      superAdmin?: boolean;
    };
    RoleDto: {
      id: string;

      code: string;

      libelle: string;
      permissions: string[];
      ordre: number;
    };
    PermissionCatalogueeDto: {
      code: string;

      libelle: string;
    };
    ModificationRoleDto: {
      libelle?: string;

      permissions?: string[];
    };
    DefinitionChampDto: {
      id: string;

      typeEntiteId: string;

      cle: string;

      libelle: string;

      typeDonnee:
        | 'texte'
        | 'nombre'
        | 'date'
        | 'datetime'
        | 'booleen'
        | 'liste'
        | 'fichier';
      obligatoire: boolean;
      estUnique: boolean;
      multiple: boolean;

      options: string[] | null;
      ordre: number;
    };
    OngletTypeLienDto: {
      typeLienId: string;

      sens: 'direct' | 'inverse';
      ordre: number;
    };
    OngletDto: {
      id: string;

      typeEntiteId: string;

      libelle: string;
      ordre: number;
      typesLiens: components['schemas']['OngletTypeLienDto'][];
    };
    TypeEntiteDto: {
      id: string;

      code: string;

      libelle: string;

      libellePluriel: string;

      icone: string;

      modeleLibelle: string;
      ordre: number;
      champs: components['schemas']['DefinitionChampDto'][];
      onglets: components['schemas']['OngletDto'][];
    };
    TypeLienDto: {
      id: string;

      code: string;

      libelle: string;

      libelleInverse: string;

      typeEntiteSourceId: string;

      typeEntiteCibleId: string;
      multiple: boolean;
      ordre: number;
    };
    ReferentielDto: {
      typesEntites: components['schemas']['TypeEntiteDto'][];
      typesLiens: components['schemas']['TypeLienDto'][];
    };
    CreationTypeEntiteDto: {
      code: string;

      libelle: string;

      libellePluriel: string;

      icone: string;

      modeleLibelle: string;
    };
    ModificationTypeEntiteDto: {
      libelle?: string;
      libellePluriel?: string;
      icone?: string;
      modeleLibelle?: string;
    };
    OrdreDto: {
      ids: string[];
    };
    ApercuGabaritDto: {
      modeleLibelle: string;
    };
    ResultatApercuDto: {
      apercu: string;
      clesCitees: string[];
    };
    CreationChampDto: {
      typeEntiteId: string;

      cle: string;

      libelle: string;

      typeDonnee:
        | 'texte'
        | 'nombre'
        | 'date'
        | 'datetime'
        | 'booleen'
        | 'liste'
        | 'fichier';

      obligatoire: boolean;

      estUnique: boolean;

      multiple: boolean;

      options?: string[];
    };
    ModificationChampDto: {
      libelle?: string;
      obligatoire?: boolean;
      estUnique?: boolean;
      multiple?: boolean;
      options?: string[];
    };
    CreationTypeLienDto: {
      code: string;

      libelle: string;

      libelleInverse: string;

      typeEntiteSourceId: string;

      typeEntiteCibleId: string;

      multiple: boolean;
    };
    ModificationTypeLienDto: {
      libelle?: string;
      libelleInverse?: string;
      multiple?: boolean;
    };
    CreationOngletDto: {
      typeEntiteId: string;

      libelle: string;
    };
    ModificationOngletDto: {
      libelle?: string;
    };
    LienDOngletDto: {
      typeLienId: string;

      sens: 'direct' | 'inverse';
    };
    CompositionOngletDto: {
      typesLiens: components['schemas']['LienDOngletDto'][];
    };
    EntiteResumeeDto: {
      id: string;

      typeEntiteId: string;
      typeCode: string;
      libelle: string;

      visibilite: 'public' | 'restreint' | 'prive';

      etat: 'actif' | 'archive';

      modifieLe: string;
    };
    SuggestionDoublonDto: {
      id: string;
      libelle: string;
      typeCode: string;

      proximite: number;

      valeurUniqueIdentique: boolean;
    };
    RattachementDto: {
      id: string;
      nom: string;

      visibilite: 'public' | 'restreint' | 'prive';
      estPivot: boolean;
    };
    FaitDeChampDto: {
      id: string;
      valeur: (string | number | boolean | unknown[]) | null;
      source: string;
      fiabilite: number;

      dateConstatation: string;

      visibilite: 'public' | 'restreint' | 'prive';

      visibiliteEffective: 'public' | 'restreint' | 'prive';
    };
    ChampDeFicheDto: {
      definitionChampId: string;
      cle: string;
      libelle: string;

      typeDonnee:
        | 'texte'
        | 'nombre'
        | 'date'
        | 'datetime'
        | 'booleen'
        | 'liste'
        | 'fichier';
      multiple: boolean;

      valeur: (string | number | boolean | unknown[]) | null;

      faits: components['schemas']['FaitDeChampDto'][];

      multiSources: boolean;
    };
    ExtremiteDto: {
      id: string;
      libelle: string;
      typeCode: string;
    };
    LienDeFicheDto: {
      faitId: string;

      sens: 'direct' | 'inverse';

      typeLienId: string;

      libelle: string;
      autreEntite: components['schemas']['ExtremiteDto'];
      source: string;
      fiabilite: number;

      dateConstatation: string;

      visibilite: 'public' | 'restreint' | 'prive';

      visibiliteEffective: 'public' | 'restreint' | 'prive';
    };
    OngletPeupleDto: {
      id: string;

      libelle: string;
      ordre: number;

      compteur: number;
      liens: components['schemas']['LienDeFicheDto'][];
    };
    FicheEntiteDto: {
      id: string;

      typeEntiteId: string;
      typeCode: string;
      libelle: string;

      visibilite: 'public' | 'restreint' | 'prive';

      etat: 'actif' | 'archive';

      modifieLe: string;
      typeLibelle: string;

      valeurs: {
        [key: string]: unknown;
      };

      contenuLisible: boolean;
      note: string | null;

      dossiers: components['schemas']['RattachementDto'][];
      champs: components['schemas']['ChampDeFicheDto'][];

      onglets: components['schemas']['OngletPeupleDto'][];

      liensHorsOnglet: components['schemas']['LienDeFicheDto'][];

      liens: components['schemas']['LienDeFicheDto'][];

      creeLe: string;

      fusionneeVersId: string | null;
    };
    EvenementHistoriqueDto: {
      id: string;

      nature: 'fait' | 'modification';
      libelle: string;
      source: string | null;
      fiabilite: number | null;

      auteur: string | null;

      survenuLe: string;
    };
    ChampSaisiDto: {
      source?: string;
      fiabilite?: number;

      dateConstatation?: string;

      visibilite?: 'public' | 'restreint' | 'prive';

      definitionChampId: string;

      valeur: string | number | boolean;
    };
    LienSaisiDto: {
      source?: string;
      fiabilite?: number;

      dateConstatation?: string;

      visibilite?: 'public' | 'restreint' | 'prive';

      typeLienId: string;

      cibleId: string;
    };
    CreationEntiteDto: {
      source?: string;
      fiabilite?: number;

      dateConstatation?: string;

      visibilite?: 'public' | 'restreint' | 'prive';

      typeEntiteId: string;

      dossierId?: string;

      note?: string;
      champs?: components['schemas']['ChampSaisiDto'][];
      liens?: components['schemas']['LienSaisiDto'][];
    };
    ModificationEntiteDto: {
      note?: string;

      visibilite?: 'public' | 'restreint' | 'prive';
    };
    FusionDto: {
      versId: string;
    };
    DossierResumeDto: {
      id: string;
      nom: string;

      visibilite: 'public' | 'restreint' | 'prive';

      etat: 'actif' | 'archive';

      entitePivotId: string;
      entitePivotLibelle: string;

      nombreSuivis: number;

      creeLe: string;
    };
    EntiteSuivieDto: {
      id: string;
      libelle: string;
      typeCode: string;
      estPivot: boolean;

      ajouteLe: string;
    };
    AgentHabiliteDto: {
      agentId: string;

      libelle: string;
      matricule: string;

      accordeLe: string;
    };
    PanneauDossierDto: {
      id: string;
      nom: string;

      visibilite: 'public' | 'restreint' | 'prive';

      etat: 'actif' | 'archive';

      entitePivotId: string;
      entitePivotLibelle: string;

      nombreSuivis: number;

      creeLe: string;

      contenuLisible: boolean;
      note: string | null;
      suivis: components['schemas']['EntiteSuivieDto'][];

      habilitations: components['schemas']['AgentHabiliteDto'][];
    };
    CreationDossierDto: {
      nom: string;

      entitePivotId: string;

      visibilite?: 'public' | 'restreint' | 'prive';

      note?: string;
    };
    ModificationDossierDto: {
      nom?: string;
      note?: string;

      visibilite?: 'public' | 'restreint' | 'prive';
    };
    DesignationEntiteDto: {
      entiteId: string;
    };
    DesignationAgentDto: {
      agentId: string;
    };
    CreationFaitDto: {
      sujetId: string;

      nature: 'champ' | 'lien';

      definitionChampId?: string;

      valeur?: string | number | boolean;

      typeLienId?: string;

      cibleId?: string;

      source: string;
      fiabilite: number;

      dateConstatation: string;

      visibilite?: 'public' | 'restreint' | 'prive';

      dossierId?: string;
    };
    FaitDto: {
      id: string;

      sujetId: string;

      nature: 'champ' | 'lien';

      definitionChampId: string | null;
      valeur: (string | number | boolean | unknown[]) | null;

      typeLienId: string | null;

      cibleId: string | null;
      source: string;
      fiabilite: number;

      dateConstatation: string;

      etat: 'actif' | 'infirme' | 'archive';

      visibilite: 'public' | 'restreint' | 'prive';

      visibiliteEffective: 'public' | 'restreint' | 'prive';

      dossierId: string | null;

      creeLe: string;

      modifieLe: string;
    };
    ModificationFaitDto: {
      valeur?: string | number | boolean;
      source?: string;
      fiabilite?: number;

      dateConstatation?: string;

      visibilite?: 'public' | 'restreint' | 'prive';
    };
    InfirmationDto: {
      motif: string;
    };
    FichierDto: {
      id: string;

      entiteId: string;

      nomOrigine: string;

      mime: 'image/jpeg' | 'image/png' | 'image/webp';

      taille: number;

      deposeLe: string;
    };
    NoeudGrapheDto: {
      id: string;
      libelle: string;
      typeCode: string;

      typeEntiteId: string;

      visibilite: 'public' | 'restreint' | 'prive';

      voisinsNonAffiches: number;

      recurrence: boolean;
      x: number | null;
      y: number | null;
    };
    AreteGrapheDto: {
      id: string;

      sujetId: string;

      cibleId: string;

      typeLienId: string;
      libelle: string;
      fiabilite: number;
    };
    VoisinageDto: {
      noeuds: components['schemas']['NoeudGrapheDto'][];
      aretes: components['schemas']['AreteGrapheDto'][];
    };
    CheminDto: {
      noeuds: components['schemas']['NoeudGrapheDto'][];
      aretes: components['schemas']['AreteGrapheDto'][];

      longueur: number;

      maillonLeFaible: number;
    };
    CheminsDto: {
      plusCourt: components['schemas']['CheminDto'] | null;

      plusSolide: components['schemas']['CheminDto'] | null;
    };
    PositionDto: {
      entiteId: string;
      x: number;
      y: number;
    };
    DispositionDto: {
      dossierId?: string;
      positions: components['schemas']['PositionDto'][];
    };
    SignalDto: {
      id: string;

      famille: 'recoupement' | 'recurrence' | 'vieillissement';

      entiteId: string;
      entiteLibelle: string;
      typeCode: string;

      resume: string;

      detail: string;

      faitId: string | null;
    };
    DossierDeLAgentDto: {
      id: string;
      nom: string;

      visibilite: 'public' | 'restreint' | 'prive';

      entitePivotId: string;
      entitePivotLibelle: string;

      motif: 'habilitation' | 'creation';
    };
    ActiviteDto: {
      faitId: string;

      entiteId: string;
      entiteLibelle: string;
      resume: string;
      source: string;
      fiabilite: number;

      auteur: string | null;

      survenuLe: string;
    };
    AccueilDto: {
      signaux: components['schemas']['SignalDto'][];
      mesDossiers: components['schemas']['DossierDeLAgentDto'][];
      derniereActivite: components['schemas']['ActiviteDto'][];
    };
    ResultatRechercheDto: {
      id: string;
      libelle: string;

      nature: 'entite' | 'dossier';
      typeCode: string | null;

      visibilite: 'public' | 'restreint' | 'prive';
    };
    SanteReponseDto: {
      etat: 'operationnel' | 'degrade';

      version: string;

      base: boolean;

      demarre_depuis: number;

      horodatage: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  JournalController_audit: {
    parameters: {
      query?: {
        agent?: string;
        cible?: string;
        action?: string;
        decalage?: unknown;
        limite?: unknown;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['EntreeAuditDto'][];
        };
      };
    };
  };
  JournalController_consultations: {
    parameters: {
      query?: {
        agent?: string;
        objet?: string;
        superAdmin?: boolean;
        derogation?: boolean;
        decalage?: unknown;
        limite?: unknown;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['EntreeConsultationDto'][];
        };
      };
    };
  };
  JournalController_orphelines: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['EntiteOrphelineDto'][];
        };
      };
    };
  };
  AuthController_connecter: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ConnexionDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['JetonDto'];
        };
      };

      401: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  AuthController_moi: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AgentConnecteDto'];
        };
      };
    };
  };
  AuthController_changerMotDePasse: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ChangementMotDePasseDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['JetonDto'];
        };
      };
    };
  };
  AuthController_deconnecter: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  AgentsController_lister: {
    parameters: {
      query?: {
        anonymises?: boolean;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AgentDto'][];
        };
      };
    };
  };
  AgentsController_creer: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreationAgentDto'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AgentAvecMotDePasseDto'];
        };
      };

      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  AgentsController_lire: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AgentDto'];
        };
      };
    };
  };
  AgentsController_modifier: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ModificationAgentDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AgentDto'];
        };
      };
    };
  };
  AgentsController_reinitialiserMotDePasse: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AgentAvecMotDePasseDto'];
        };
      };
    };
  };
  AgentsController_anonymiser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AgentDto'];
        };
      };

      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  RolesController_lister: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RoleDto'][];
        };
      };
    };
  };
  RolesController_catalogue: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PermissionCatalogueeDto'][];
        };
      };
    };
  };
  RolesController_modifier: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ModificationRoleDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RoleDto'];
        };
      };
    };
  };
  ReferentielController_catalogue: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReferentielDto'];
        };
      };
    };
  };
  ReferentielController_creerTypeEntite: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreationTypeEntiteDto'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TypeEntiteDto'];
        };
      };
    };
  };
  ReferentielController_supprimerTypeEntite: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };

      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  ReferentielController_modifierTypeEntite: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ModificationTypeEntiteDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TypeEntiteDto'];
        };
      };
    };
  };
  ReferentielController_ordonnerTypesEntites: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OrdreDto'];
      };
    };
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  ReferentielController_apercuGabarit: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ApercuGabaritDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ResultatApercuDto'];
        };
      };
    };
  };
  ReferentielController_creerChamp: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreationChampDto'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefinitionChampDto'];
        };
      };
    };
  };
  ReferentielController_supprimerChamp: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  ReferentielController_modifierChamp: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ModificationChampDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefinitionChampDto'];
        };
      };
    };
  };
  ReferentielController_ordonnerChamps: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OrdreDto'];
      };
    };
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  ReferentielController_creerTypeLien: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreationTypeLienDto'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TypeLienDto'];
        };
      };
    };
  };
  ReferentielController_supprimerTypeLien: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  ReferentielController_modifierTypeLien: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ModificationTypeLienDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TypeLienDto'];
        };
      };
    };
  };
  ReferentielController_creerOnglet: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreationOngletDto'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OngletDto'];
        };
      };
    };
  };
  ReferentielController_supprimerOnglet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  ReferentielController_modifierOnglet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ModificationOngletDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OngletDto'];
        };
      };
    };
  };
  ReferentielController_ordonnerOnglets: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OrdreDto'];
      };
    };
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  ReferentielController_composerOnglet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CompositionOngletDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OngletDto'];
        };
      };

      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  EntitesController_lister: {
    parameters: {
      query?: {
        type?: string;
        q?: string;
        etat?: 'actif' | 'archive';
        decalage?: unknown;
        limite?: unknown;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['EntiteResumeeDto'][];
        };
      };
    };
  };
  EntitesController_creer: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreationEntiteDto'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FicheEntiteDto'];
        };
      };

      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  EntitesController_similaires: {
    parameters: {
      query: {
        q: string;
        type?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SuggestionDoublonDto'][];
        };
      };
    };
  };
  EntitesController_lire: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FicheEntiteDto'];
        };
      };

      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  EntitesController_modifier: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ModificationEntiteDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FicheEntiteDto'];
        };
      };
    };
  };
  EntitesController_historique: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['EvenementHistoriqueDto'][];
        };
      };
    };
  };
  EntitesController_annulerCreation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };

      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  EntitesController_fusionner: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FusionDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FicheEntiteDto'];
        };
      };

      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  EntitesController_archiver: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FicheEntiteDto'];
        };
      };
    };
  };
  EntitesController_desarchiver: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FicheEntiteDto'];
        };
      };
    };
  };
  DossiersController_lister: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DossierResumeDto'][];
        };
      };
    };
  };
  DossiersController_creer: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreationDossierDto'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PanneauDossierDto'];
        };
      };

      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  DossiersController_panneau: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PanneauDossierDto'];
        };
      };

      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  DossiersController_modifier: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ModificationDossierDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PanneauDossierDto'];
        };
      };
    };
  };
  DossiersController_suivre: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['DesignationEntiteDto'];
      };
    };
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  DossiersController_nePlusSuivre: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
        entiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };

      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  DossiersController_habiliter: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['DesignationAgentDto'];
      };
    };
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  DossiersController_retirerHabilitation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
        agentId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  FaitsController_creer: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreationFaitDto'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FaitDto'];
        };
      };
    };
  };
  FaitsController_modifier: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ModificationFaitDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FaitDto'];
        };
      };
    };
  };
  FaitsController_infirmer: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['InfirmationDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FaitDto'];
        };
      };

      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  FichiersController_lister: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FichierDto'][];
        };
      };
    };
  };
  FichiersController_deposer: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'multipart/form-data': {
          fichier?: string;
        };
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FichierDto'];
        };
      };

      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };

      413: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  FichiersController_telecharger: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };

      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  FichiersController_supprimer: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };

      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };

      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  GrapheController_voisinage: {
    parameters: {
      query: {
        depuis: string;

        profondeur?: number;

        fiabilite?: number;
        dossier?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['VoisinageDto'];
        };
      };
    };
  };
  GrapheController_vueEntiere: {
    parameters: {
      query?: {
        fiabilite?: number;
        dossier?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['VoisinageDto'];
        };
      };
    };
  };
  GrapheController_chemin: {
    parameters: {
      query: {
        de: string;
        vers: string;
        fiabilite?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CheminsDto'];
        };
      };
    };
  };
  GrapheController_enregistrerPositions: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['DispositionDto'];
      };
    };
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  SignauxController_accueil: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AccueilDto'];
        };
      };
    };
  };
  SignauxController_liste: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SignalDto'][];
        };
      };
    };
  };
  SignauxController_rechercher: {
    parameters: {
      query: {
        q: unknown;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ResultatRechercheDto'][];
        };
      };
    };
  };
  SanteController_lire: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SanteReponseDto'];
        };
      };

      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SanteReponseDto'];
        };
      };
    };
  };
}
