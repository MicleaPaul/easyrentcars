/*
  # Fix False Deposit and Payment Information in Terms & Conditions

  1. Changes
    - Remove false "Credit card for deposit" from rental requirements
    - Update deposit section to reflect actual payment methods (cash vs. card online)
    - Remove references to EUR 500 deposit at pickup
    - Clarify that no credit card is needed at pickup

  2. Security
    - No RLS changes needed (read-only data update)
*/

-- Update Rental Requirements - Remove credit card requirement
UPDATE terms_and_conditions
SET
  content_de = '["Mindestalter: 25 Jahre", "Gültiger Führerschein: Mindestens 5 Jahre", "Gültiger Personalausweis oder Reisepass"]'::jsonb,
  content_en = '["Minimum age: 25 years", "Valid driving license: At least 5 years", "Valid ID card or passport"]'::jsonb,
  content_it = '["Età minima: 25 anni", "Patente di guida valida: Almeno 5 anni", "Carta d''identità o passaporto validi"]'::jsonb,
  content_fr = '["Âge minimum: 25 ans", "Permis de conduire valide: Au moins 5 ans", "Carte d''identité ou passeport valide"]'::jsonb,
  content_es = '["Edad mínima: 25 años", "Licencia de conducir válida: Al menos 5 años", "Documento de identidad o pasaporte válido"]'::jsonb,
  content_ro = '["Vârsta minimă: 25 ani", "Permis de conducere valid: Cel puțin 5 ani", "Carte de identitate sau pașaport valabil"]'::jsonb
WHERE section_key = 'rental_requirements';

-- Update Deposit & Payment section with correct information
UPDATE terms_and_conditions
SET
  heading_de = 'ZAHLUNG',
  heading_en = 'PAYMENT',
  heading_it = 'PAGAMENTO',
  heading_fr = 'PAIEMENT',
  heading_es = 'PAGO',
  heading_ro = 'PLATĂ',
  content_de = '["Zahlungsoption Bargeld: 1 Tag Miete wird online bezahlt, Restbetrag in bar bei Abholung", "Zahlungsoption Kreditkarte: Vollständige Zahlung wird online abgeschlossen", "Bei Abholung: Nur gültiger Führerschein und Personalausweis/Reisepass erforderlich", "Keine Kreditkarte bei Abholung erforderlich"]'::jsonb,
  content_en = '["Cash payment option: 1 day rental paid online, remaining amount in cash at pickup", "Credit card payment option: Full payment completed online", "At pickup: Only valid driving license and ID/passport required", "No credit card required at pickup"]'::jsonb,
  content_it = '["Opzione pagamento contanti: 1 giorno di noleggio pagato online, importo rimanente in contanti al ritiro", "Opzione pagamento carta di credito: Pagamento completo online", "Al ritiro: Solo patente valida e carta d''identità/passaporto richiesti", "Nessuna carta di credito richiesta al ritiro"]'::jsonb,
  content_fr = '["Option paiement en espèces: 1 jour de location payé en ligne, montant restant en espèces à la prise en charge", "Option paiement par carte: Paiement complet en ligne", "À la prise en charge: Seuls le permis de conduire et la carte d''identité/passeport sont requis", "Aucune carte de crédit requise à la prise en charge"]'::jsonb,
  content_es = '["Opción de pago en efectivo: 1 día de alquiler pagado en línea, cantidad restante en efectivo en la recogida", "Opción de pago con tarjeta: Pago completo en línea", "En la recogida: Solo se requiere licencia de conducir válida y documento de identidad/pasaporte", "No se requiere tarjeta de crédito en la recogida"]'::jsonb,
  content_ro = '["Opțiune plată numerar: 1 zi de închiriere plătită online, suma rămasă în numerar la preluare", "Opțiune plată card: Plată completă online", "La preluare: Doar permis de conducere valid și carte de identitate/pașaport necesare", "Nu este necesar card de credit la preluare"]'::jsonb
WHERE section_key = 'deposit_payment';
