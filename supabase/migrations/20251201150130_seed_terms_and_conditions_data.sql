/*
  # Seed Terms and Conditions Data

  Inserts initial AGB/Terms content in all 6 languages (German, English, French, Italian, Spanish, Romanian)
  
  Sections:
  1. Rental Rates (Mietpreise)
  2. Requirements (Voraussetzungen)
  3. Deposit & Payment (Kaution und Zahlung)
  4. Insurance (Versicherung)
  5. Fuel (Kraftstoff)
  6. Vehicle Condition (Fahrzeugzustand)
  7. Cancellation Policy (Stornierungsbedingungen)
  8. Terms of Use (Nutzungsbedingungen)
  9. Contact (Kontakt)
*/

-- Insert Rental Rates section
INSERT INTO terms_and_conditions (section_key, heading_de, heading_en, heading_fr, heading_it, heading_es, heading_ro, content_de, content_en, content_fr, content_it, content_es, content_ro, display_order, is_active)
VALUES (
  'rental_rates',
  'MIETPREISE',
  'RENTAL RATES',
  'TARIFS DE LOCATION',
  'TARIFFE DI NOLEGGIO',
  'TARIFAS DE ALQUILER',
  'TARIFE DE ÎNCHIRIERE',
  '["Tagesmiete: 29 EUR (200 km pro Tag)", "Wochenmiete: 189 EUR (1400 km)", "Monatsmiete: 699 EUR (6000 km)", "Jeder zusätzliche Kilometer: 0,27 EUR", "Einwegmiete außerhalb von Graz: 20 EUR"]'::jsonb,
  '["Daily rental: 29 EUR (200 km per day)", "Weekly rental: 189 EUR (1400 km)", "Monthly rental: 699 EUR (6000 km)", "Each additional kilometer: 0.27 EUR", "One-way rental outside Graz: 20 EUR"]'::jsonb,
  '["Location journalière: 29 EUR (200 km par jour)", "Location hebdomadaire: 189 EUR (1400 km)", "Location mensuelle: 699 EUR (6000 km)", "Chaque kilomètre supplémentaire: 0,27 EUR", "Location aller simple hors Graz: 20 EUR"]'::jsonb,
  '["Noleggio giornaliero: 29 EUR (200 km al giorno)", "Noleggio settimanale: 189 EUR (1400 km)", "Noleggio mensile: 699 EUR (6000 km)", "Ogni chilometro aggiuntivo: 0,27 EUR", "Noleggio di sola andata fuori Graz: 20 EUR"]'::jsonb,
  '["Alquiler diario: 29 EUR (200 km por día)", "Alquiler semanal: 189 EUR (1400 km)", "Alquiler mensual: 699 EUR (6000 km)", "Cada kilómetro adicional: 0,27 EUR", "Alquiler de ida fuera de Graz: 20 EUR"]'::jsonb,
  '["Închiriere zilnică: 29 EUR (200 km pe zi)", "Închiriere săptămânală: 189 EUR (1400 km)", "Închiriere lunară: 699 EUR (6000 km)", "Fiecare kilometru suplimentar: 0,27 EUR", "Închiriere dus în afara Graz: 20 EUR"]'::jsonb,
  1,
  true
) ON CONFLICT (section_key) DO NOTHING;

-- Insert Requirements section
INSERT INTO terms_and_conditions (section_key, heading_de, heading_en, heading_fr, heading_it, heading_es, heading_ro, content_de, content_en, content_fr, content_it, content_es, content_ro, display_order, is_active)
VALUES (
  'requirements',
  'VORAUSSETZUNGEN FÜR DIE ANMIETUNG',
  'RENTAL REQUIREMENTS',
  'CONDITIONS DE LOCATION',
  'REQUISITI PER IL NOLEGGIO',
  'REQUISITOS DE ALQUILER',
  'CERINȚE PENTRU ÎNCHIRIERE',
  '["Mindestalter: 25 Jahre", "Gültiger Führerschein: Mindestens 5 Jahre", "Gültiger Personalausweis oder Reisepass", "Kreditkarte für Kaution"]'::jsonb,
  '["Minimum age: 25 years", "Valid driving license: At least 5 years", "Valid ID card or passport", "Credit card for deposit"]'::jsonb,
  '["Âge minimum: 25 ans", "Permis de conduire valide: Au moins 5 ans", "Carte d''identité ou passeport valide", "Carte de crédit pour la caution"]'::jsonb,
  '["Età minima: 25 anni", "Patente di guida valida: Almeno 5 anni", "Carta d''identità o passaporto validi", "Carta di credito per il deposito"]'::jsonb,
  '["Edad mínima: 25 años", "Licencia de conducir válida: Al menos 5 años", "Documento de identidad o pasaporte válido", "Tarjeta de crédito para el depósito"]'::jsonb,
  '["Vârsta minimă: 25 ani", "Permis de conducere valabil: Minimum 5 ani", "Carte de identitate sau pașaport valabil", "Card de credit pentru depozit"]'::jsonb,
  2,
  true
) ON CONFLICT (section_key) DO NOTHING;

-- Insert Deposit & Payment section
INSERT INTO terms_and_conditions (section_key, heading_de, heading_en, heading_fr, heading_it, heading_es, heading_ro, content_de, content_en, content_fr, content_it, content_es, content_ro, display_order, is_active)
VALUES (
  'deposit_payment',
  'KAUTION UND ZAHLUNG',
  'DEPOSIT AND PAYMENT',
  'CAUTION ET PAIEMENT',
  'DEPOSITO E PAGAMENTO',
  'DEPÓSITO Y PAGO',
  'DEPOZIT ȘI PLATĂ',
  '["Kaution: 500 EUR (bei Abholung)", "Die Kaution wird bei Rückgabe des Fahrzeugs in einwandfreiem Zustand vollständig erstattet", "Zahlung: Bar oder Kreditkarte", "Die Miete ist bei Abholung des Fahrzeugs zu bezahlen"]'::jsonb,
  '["Deposit: 500 EUR (upon pickup)", "The deposit will be fully refunded upon return of the vehicle in perfect condition", "Payment: Cash or credit card", "Rental must be paid upon vehicle pickup"]'::jsonb,
  '["Caution: 500 EUR (lors de la prise en charge)", "La caution sera entièrement remboursée lors du retour du véhicule en parfait état", "Paiement: Espèces ou carte de crédit", "La location doit être payée lors de la prise en charge du véhicule"]'::jsonb,
  '["Deposito: 500 EUR (al ritiro)", "Il deposito sarà completamente rimborsato al ritorno del veicolo in perfette condizioni", "Pagamento: Contanti o carta di credito", "Il noleggio deve essere pagato al ritiro del veicolo"]'::jsonb,
  '["Depósito: 500 EUR (al recoger)", "El depósito se reembolsará completamente al devolver el vehículo en perfecto estado", "Pago: Efectivo o tarjeta de crédito", "El alquiler debe pagarse al recoger el vehículo"]'::jsonb,
  '["Depozit: 500 EUR (la ridicare)", "Depozitul va fi restituit integral la returnarea vehiculului în stare perfectă", "Plată: Numerar sau card de credit", "Chiria trebuie plătită la ridicarea vehiculului"]'::jsonb,
  3,
  true
) ON CONFLICT (section_key) DO NOTHING;

-- Insert Insurance section
INSERT INTO terms_and_conditions (section_key, heading_de, heading_en, heading_fr, heading_it, heading_es, heading_ro, content_de, content_en, content_fr, content_it, content_es, content_ro, display_order, is_active)
VALUES (
  'insurance',
  'VERSICHERUNG',
  'INSURANCE',
  'ASSURANCE',
  'ASSICURAZIONE',
  'SEGURO',
  'ASIGURARE',
  '["Vollkaskoversicherung mit 1000 EUR Selbstbeteiligung", "Haftpflichtversicherung inklusive", "Diebstahlschutz inklusive", "Zusätzliche Fahrer: 5 EUR pro Tag"]'::jsonb,
  '["Comprehensive insurance with 1000 EUR deductible", "Liability insurance included", "Theft protection included", "Additional drivers: 5 EUR per day"]'::jsonb,
  '["Assurance tous risques avec franchise de 1000 EUR", "Assurance responsabilité civile incluse", "Protection contre le vol incluse", "Conducteurs supplémentaires: 5 EUR par jour"]'::jsonb,
  '["Assicurazione kasko con franchigia di 1000 EUR", "Assicurazione di responsabilità civile inclusa", "Protezione furto inclusa", "Conducenti aggiuntivi: 5 EUR al giorno"]'::jsonb,
  '["Seguro a todo riesgo con franquicia de 1000 EUR", "Seguro de responsabilidad civil incluido", "Protección contra robo incluida", "Conductores adicionales: 5 EUR por día"]'::jsonb,
  '["Asigurare casco cu franșiză de 1000 EUR", "Asigurare de răspundere civilă inclusă", "Protecție împotriva furtului inclusă", "Șoferi suplimentari: 5 EUR pe zi"]'::jsonb,
  4,
  true
) ON CONFLICT (section_key) DO NOTHING;

-- Insert Fuel section
INSERT INTO terms_and_conditions (section_key, heading_de, heading_en, heading_fr, heading_it, heading_es, heading_ro, content_de, content_en, content_fr, content_it, content_es, content_ro, display_order, is_active)
VALUES (
  'fuel',
  'KRAFTSTOFF',
  'FUEL',
  'CARBURANT',
  'CARBURANTE',
  'COMBUSTIBLE',
  'COMBUSTIBIL',
  '["Das Fahrzeug wird mit vollem Tank übergeben", "Das Fahrzeug muss mit vollem Tank zurückgegeben werden", "Bei nicht vollständig gefülltem Tank wird eine Gebühr von 50 EUR plus Kraftstoffkosten berechnet"]'::jsonb,
  '["Vehicle is delivered with a full tank", "Vehicle must be returned with a full tank", "If tank is not full, a fee of 50 EUR plus fuel costs will be charged"]'::jsonb,
  '["Le véhicule est livré avec le plein", "Le véhicule doit être retourné avec le plein", "Si le réservoir n''est pas plein, des frais de 50 EUR plus le coût du carburant seront facturés"]'::jsonb,
  '["Il veicolo viene consegnato con il pieno", "Il veicolo deve essere restituito con il pieno", "Se il serbatoio non è pieno, verrà addebitata una tariffa di 50 EUR più i costi del carburante"]'::jsonb,
  '["El vehículo se entrega con el tanque lleno", "El vehículo debe devolverse con el tanque lleno", "Si el tanque no está lleno, se cobrará una tarifa de 50 EUR más los costos de combustible"]'::jsonb,
  '["Vehiculul este livrat cu rezervorul plin", "Vehiculul trebuie returnat cu rezervorul plin", "Dacă rezervorul nu este plin, se va percepe o taxă de 50 EUR plus costurile combustibilului"]'::jsonb,
  5,
  true
) ON CONFLICT (section_key) DO NOTHING;

-- Insert Vehicle Condition section
INSERT INTO terms_and_conditions (section_key, heading_de, heading_en, heading_fr, heading_it, heading_es, heading_ro, content_de, content_en, content_fr, content_it, content_es, content_ro, display_order, is_active)
VALUES (
  'vehicle_condition',
  'FAHRZEUGZUSTAND UND SCHÄDEN',
  'VEHICLE CONDITION AND DAMAGES',
  'ÉTAT DU VÉHICULE ET DOMMAGES',
  'CONDIZIONI DEL VEICOLO E DANNI',
  'CONDICIÓN DEL VEHÍCULO Y DAÑOS',
  'STAREA VEHICULULUI ȘI DAUNE',
  '["Der Mieter ist für alle Schäden am Fahrzeug während der Mietzeit verantwortlich", "Kleine Schäden (Kratzer, Dellen): Reparaturkosten", "Große Schäden: Selbstbeteiligung von 1000 EUR", "Bei Verlust des Fahrzeugschlüssels: 300 EUR"]'::jsonb,
  '["The renter is responsible for all damages to the vehicle during the rental period", "Minor damages (scratches, dents): Repair costs", "Major damages: Deductible of 1000 EUR", "Loss of vehicle key: 300 EUR"]'::jsonb,
  '["Le locataire est responsable de tous les dommages au véhicule pendant la période de location", "Dommages mineurs (rayures, bosses): Coûts de réparation", "Dommages majeurs: Franchise de 1000 EUR", "Perte de la clé du véhicule: 300 EUR"]'::jsonb,
  '["Il locatario è responsabile di tutti i danni al veicolo durante il periodo di noleggio", "Danni minori (graffi, ammaccature): Costi di riparazione", "Danni maggiori: Franchigia di 1000 EUR", "Perdita della chiave del veicolo: 300 EUR"]'::jsonb,
  '["El arrendatario es responsable de todos los daños al vehículo durante el período de alquiler", "Daños menores (arañazos, abolladuras): Costos de reparación", "Daños mayores: Franquicia de 1000 EUR", "Pérdida de llave del vehículo: 300 EUR"]'::jsonb,
  '["Chiriașul este responsabil pentru toate daunele aduse vehiculului în perioada de închiriere", "Daune minore (zgârieturi, lovituri): Costuri de reparație", "Daune majore: Franșiză de 1000 EUR", "Pierderea cheii vehiculului: 300 EUR"]'::jsonb,
  6,
  true
) ON CONFLICT (section_key) DO NOTHING;

-- Insert Cancellation Policy section
INSERT INTO terms_and_conditions (section_key, heading_de, heading_en, heading_fr, heading_it, heading_es, heading_ro, content_de, content_en, content_fr, content_it, content_es, content_ro, display_order, is_active)
VALUES (
  'cancellation',
  'STORNIERUNGSBEDINGUNGEN',
  'CANCELLATION POLICY',
  'POLITIQUE D''ANNULATION',
  'POLITICA DI CANCELLAZIONE',
  'POLÍTICA DE CANCELACIÓN',
  'POLITICA DE ANULARE',
  '["Kostenlose Stornierung bis 48 Stunden vor Mietbeginn", "Stornierung 24-48 Stunden vorher: 50% der Mietkosten", "Stornierung weniger als 24 Stunden vorher: 100% der Mietkosten"]'::jsonb,
  '["Free cancellation up to 48 hours before rental start", "Cancellation 24-48 hours in advance: 50% of rental costs", "Cancellation less than 24 hours in advance: 100% of rental costs"]'::jsonb,
  '["Annulation gratuite jusqu''à 48 heures avant le début de la location", "Annulation 24-48 heures à l''avance: 50% des frais de location", "Annulation moins de 24 heures à l''avance: 100% des frais de location"]'::jsonb,
  '["Cancellazione gratuita fino a 48 ore prima dell''inizio del noleggio", "Cancellazione 24-48 ore prima: 50% dei costi di noleggio", "Cancellazione meno di 24 ore prima: 100% dei costi di noleggio"]'::jsonb,
  '["Cancelación gratuita hasta 48 horas antes del inicio del alquiler", "Cancelación 24-48 horas antes: 50% de los costos de alquiler", "Cancelación menos de 24 horas antes: 100% de los costos de alquiler"]'::jsonb,
  '["Anulare gratuită până la 48 ore înainte de începerea închirierii", "Anulare cu 24-48 ore înainte: 50% din costurile de închiriere", "Anulare cu mai puțin de 24 ore înainte: 100% din costurile de închiriere"]'::jsonb,
  7,
  true
) ON CONFLICT (section_key) DO NOTHING;

-- Insert Terms of Use section
INSERT INTO terms_and_conditions (section_key, heading_de, heading_en, heading_fr, heading_it, heading_es, heading_ro, content_de, content_en, content_fr, content_it, content_es, content_ro, display_order, is_active)
VALUES (
  'terms_of_use',
  'NUTZUNGSBEDINGUNGEN',
  'TERMS OF USE',
  'CONDITIONS D''UTILISATION',
  'CONDIZIONI D''USO',
  'CONDICIONES DE USO',
  'CONDIȚII DE UTILIZARE',
  '["Das Fahrzeug darf nur im Hoheitsgebiet Österreichs genutzt werden", "Rauchen im Fahrzeug ist strengstens verboten (Strafe: 200 EUR)", "Haustiere sind nur mit vorheriger Genehmigung erlaubt (Reinigungsgebühr: 50 EUR)", "Das Fahrzeug darf nicht für kommerzielle Zwecke verwendet werden", "Das Fahrzeug darf nicht für Rennen oder illegale Aktivitäten verwendet werden"]'::jsonb,
  '["Vehicle may only be used within Austrian territory", "Smoking in the vehicle is strictly prohibited (penalty: 200 EUR)", "Pets are only allowed with prior approval (cleaning fee: 50 EUR)", "Vehicle may not be used for commercial purposes", "Vehicle may not be used for racing or illegal activities"]'::jsonb,
  '["Le véhicule ne peut être utilisé que sur le territoire autrichien", "Il est strictement interdit de fumer dans le véhicule (pénalité: 200 EUR)", "Les animaux ne sont autorisés qu''avec approbation préalable (frais de nettoyage: 50 EUR)", "Le véhicule ne peut pas être utilisé à des fins commerciales", "Le véhicule ne peut pas être utilisé pour des courses ou des activités illégales"]'::jsonb,
  '["Il veicolo può essere utilizzato solo sul territorio austriaco", "È severamente vietato fumare nel veicolo (penalità: 200 EUR)", "Gli animali domestici sono ammessi solo con approvazione preventiva (tariffa di pulizia: 50 EUR)", "Il veicolo non può essere utilizzato per scopi commerciali", "Il veicolo non può essere utilizzato per gare o attività illegali"]'::jsonb,
  '["El vehículo solo puede usarse en territorio austriaco", "Está estrictamente prohibido fumar en el vehículo (multa: 200 EUR)", "Las mascotas solo se permiten con aprobación previa (tarifa de limpieza: 50 EUR)", "El vehículo no puede usarse con fines comerciales", "El vehículo no puede usarse para carreras o actividades ilegales"]'::jsonb,
  '["Vehiculul poate fi utilizat doar pe teritoriul Austriei", "Fumatul în vehicul este strict interzis (penalizare: 200 EUR)", "Animalele de companie sunt permise doar cu aprobare prealabilă (taxă de curățare: 50 EUR)", "Vehiculul nu poate fi utilizat în scopuri comerciale", "Vehiculul nu poate fi utilizat pentru curse sau activități ilegale"]'::jsonb,
  8,
  true
) ON CONFLICT (section_key) DO NOTHING;

-- Insert Contact section
INSERT INTO terms_and_conditions (section_key, heading_de, heading_en, heading_fr, heading_it, heading_es, heading_ro, content_de, content_en, content_fr, content_it, content_es, content_ro, display_order, is_active)
VALUES (
  'contact',
  'KONTAKT',
  'CONTACT',
  'CONTACT',
  'CONTATTO',
  'CONTACTO',
  'CONTACT',
  '["EasyRentCars", "Graz, Österreich", "Telefon: +43 664 1584950", "E-Mail: info@easyrentgraz.at"]'::jsonb,
  '["EasyRentCars", "Graz, Austria", "Phone: +43 664 1584950", "Email: info@easyrentgraz.at"]'::jsonb,
  '["EasyRentCars", "Graz, Autriche", "Téléphone: +43 664 1584950", "Email: info@easyrentgraz.at"]'::jsonb,
  '["EasyRentCars", "Graz, Austria", "Telefono: +43 664 1584950", "Email: info@easyrentgraz.at"]'::jsonb,
  '["EasyRentCars", "Graz, Austria", "Teléfono: +43 664 1584950", "Email: info@easyrentgraz.at"]'::jsonb,
  '["EasyRentCars", "Graz, Austria", "Telefon: +43 664 1584950", "Email: info@easyrentgraz.at"]'::jsonb,
  9,
  true
) ON CONFLICT (section_key) DO NOTHING;
