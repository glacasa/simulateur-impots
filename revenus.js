class Revenu {
  constructor(type, montant, abattement, csg) {
    this.type = type;
    this.montant = montant;
    this.abattement = abattement;
    this.csg = csg;
  }

  montantImposable() {
    return Math.round(this.montant * (1 - this.abattement));
  }
}

class Salaire extends Revenu {
  constructor(montant) {
    super("Revenu d'activité", montant, 0.1, false);
  }
}

class Foncier extends Revenu {
  constructor(montant) {
    super("Revenu foncier", montant, 0.3, true);
  }
}

class Dividende extends Revenu {  
  constructor(montant) {
    super("Dividendes", montant, 0.4, true);
  }
}
