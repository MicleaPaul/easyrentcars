/*
  # Reset Complete FAQs System

  ## Purpose
  Complete reset and recreation of the FAQs table with proper structure and data.

  ## Changes
  1. Drop existing FAQs table and all policies
  2. Recreate FAQs table with all 6 languages (DE, EN, FR, IT, ES, RO)
  3. Add metadata fields (is_popular, display_order, is_hidden)
  4. Create comprehensive RLS policies for public read and admin management
  5. Insert 5 initial FAQs with complete translations

  ## Structure
  - id: uuid (primary key)
  - question_de, answer_de: German translations
  - question_en, answer_en: English translations  
  - question_fr, answer_fr: French translations
  - question_it, answer_it: Italian translations
  - question_es, answer_es: Spanish translations
  - question_ro, answer_ro: Romanian translations
  - is_popular: boolean (for highlighting popular questions)
  - display_order: integer (for manual sorting)
  - is_hidden: boolean (for hiding FAQs without deleting)
  - created_at, updated_at: timestamps

  ## Security
  - RLS enabled
  - Public (anon + authenticated) can SELECT non-hidden FAQs
  - Only admins can INSERT, UPDATE, DELETE
  - Admins can view all FAQs including hidden ones
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view visible FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can view all FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can insert FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can update FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can delete FAQs" ON faqs;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_faqs_display_order;
DROP INDEX IF EXISTS idx_faqs_is_hidden;

-- Drop and recreate FAQs table
DROP TABLE IF EXISTS faqs CASCADE;

CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- German
  question_de text NOT NULL DEFAULT '',
  answer_de text NOT NULL DEFAULT '',
  
  -- English
  question_en text NOT NULL DEFAULT '',
  answer_en text NOT NULL DEFAULT '',
  
  -- French
  question_fr text NOT NULL DEFAULT '',
  answer_fr text NOT NULL DEFAULT '',
  
  -- Italian
  question_it text NOT NULL DEFAULT '',
  answer_it text NOT NULL DEFAULT '',
  
  -- Spanish
  question_es text NOT NULL DEFAULT '',
  answer_es text NOT NULL DEFAULT '',
  
  -- Romanian
  question_ro text NOT NULL DEFAULT '',
  answer_ro text NOT NULL DEFAULT '',
  
  -- Metadata
  is_popular boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_hidden boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_faqs_display_order ON faqs(display_order);
CREATE INDEX idx_faqs_is_hidden ON faqs(is_hidden);

-- Create updated_at trigger
CREATE TRIGGER update_faqs_updated_at 
  BEFORE UPDATE ON faqs
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS POLICIES

-- PUBLIC SELECT: Anyone can view non-hidden FAQs
CREATE POLICY "Public can view visible FAQs"
  ON faqs FOR SELECT
  TO anon, authenticated
  USING (is_hidden = false);

-- ADMIN SELECT: Admins can view all FAQs (including hidden)
CREATE POLICY "Admins can view all FAQs"
  ON faqs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- ADMIN INSERT: Admins can create new FAQs
CREATE POLICY "Admins can insert FAQs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- ADMIN UPDATE: Admins can update FAQs
CREATE POLICY "Admins can update FAQs"
  ON faqs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- ADMIN DELETE: Admins can delete FAQs
CREATE POLICY "Admins can delete FAQs"
  ON faqs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Insert 5 initial FAQs with complete translations

-- FAQ 1: Documents required
INSERT INTO faqs (question_de, answer_de, question_en, answer_en, question_fr, answer_fr, question_it, answer_it, question_es, answer_es, question_ro, answer_ro, is_popular, display_order, is_hidden)
VALUES (
  'Welche Dokumente werden für die Anmietung benötigt?',
  'Für die Anmietung eines Fahrzeugs benötigen Sie einen gültigen Führerschein (mindestens 1 Jahr alt), einen Personalausweis oder Reisepass und eine Kreditkarte auf den Namen des Hauptfahrers. Internationale Fahrer benötigen möglicherweise einen internationalen Führerschein.',
  'What documents are required for renting?',
  'To rent a vehicle, you need a valid driver''s license (at least 1 year old), an ID card or passport, and a credit card in the main driver''s name. International drivers may need an international driver''s license.',
  'Quels documents sont nécessaires pour la location?',
  'Pour louer un véhicule, vous avez besoin d''un permis de conduire valide (au moins 1 an), d''une carte d''identité ou d''un passeport et d''une carte de crédit au nom du conducteur principal. Les conducteurs internationaux peuvent avoir besoin d''un permis de conduire international.',
  'Quali documenti sono necessari per il noleggio?',
  'Per noleggiare un veicolo, è necessaria una patente di guida valida (almeno 1 anno), una carta d''identità o passaporto e una carta di credito intestata al conducente principale. I conducenti internazionali potrebbero aver bisogno di una patente internazionale.',
  '¿Qué documentos se requieren para alquilar?',
  'Para alquilar un vehículo, necesita una licencia de conducir válida (al menos 1 año), una tarjeta de identidad o pasaporte y una tarjeta de crédito a nombre del conductor principal. Los conductores internacionales pueden necesitar una licencia de conducir internacional.',
  'Ce documente sunt necesare pentru închiriere?',
  'Pentru a închiria un vehicul, aveți nevoie de un permis de conducere valid (cel puțin 1 an), o carte de identitate sau pașaport și o carte de credit pe numele conducătorului principal. Șoferii internaționali ar putea avea nevoie de un permis de conducere internațional.',
  true,
  1,
  false
);

-- FAQ 2: Fuel policy
INSERT INTO faqs (question_de, answer_de, question_en, answer_en, question_fr, answer_fr, question_it, answer_it, question_es, answer_es, question_ro, answer_ro, is_popular, display_order, is_hidden)
VALUES (
  'Wie funktioniert die Kraftstoffpolitik?',
  'Wir arbeiten mit einer Voll-zu-Voll-Kraftstoffpolitik. Sie erhalten das Fahrzeug mit vollem Tank und geben es mit vollem Tank zurück. Wenn Sie das Fahrzeug nicht vollgetankt zurückgeben, berechnen wir die fehlende Kraftstoffmenge zuzüglich einer Servicegebühr.',
  'How does the fuel policy work?',
  'We operate a full-to-full fuel policy. You receive the vehicle with a full tank and return it with a full tank. If you don''t return the vehicle with a full tank, we will charge for the missing fuel amount plus a service fee.',
  'Comment fonctionne la politique de carburant?',
  'Nous appliquons une politique de carburant plein à plein. Vous recevez le véhicule avec un réservoir plein et le retournez avec un réservoir plein. Si vous ne retournez pas le véhicule avec un réservoir plein, nous facturerons le carburant manquant plus des frais de service.',
  'Come funziona la politica del carburante?',
  'Applichiamo una politica di carburante pieno a pieno. Ricevi il veicolo con il serbatoio pieno e lo restituisci con il serbatoio pieno. Se non restituisci il veicolo con il serbatoio pieno, addebiteremo il carburante mancante più una commissione di servizio.',
  '¿Cómo funciona la política de combustible?',
  'Operamos con una política de combustible lleno a lleno. Recibe el vehículo con el tanque lleno y lo devuelve con el tanque lleno. Si no devuelve el vehículo con el tanque lleno, cobraremos el combustible faltante más una tarifa de servicio.',
  'Cum funcționează politica de combustibil?',
  'Funcționăm cu o politică de combustibil plin la plin. Primiți vehiculul cu rezervorul plin și îl returnați cu rezervorul plin. Dacă nu returnați vehiculul cu rezervorul plin, vom percepe combustibilul lipsă plus o taxă de serviciu.',
  true,
  2,
  false
);

-- FAQ 3: Additional driver
INSERT INTO faqs (question_de, answer_de, question_en, answer_en, question_fr, answer_fr, question_it, answer_it, question_es, answer_es, question_ro, answer_ro, is_popular, display_order, is_hidden)
VALUES (
  'Kann ich einen zusätzlichen Fahrer hinzufügen?',
  'Ja, Sie können zusätzliche Fahrer gegen eine Gebühr hinzufügen. Alle zusätzlichen Fahrer müssen die gleichen Anforderungen erfüllen wie der Hauptfahrer (gültiger Führerschein, mindestens 25 Jahre alt) und müssen bei der Abholung anwesend sein, um ihre Dokumente vorzulegen.',
  'Can I add an additional driver?',
  'Yes, you can add additional drivers for a fee. All additional drivers must meet the same requirements as the main driver (valid license, at least 25 years old) and must be present at pickup to present their documents.',
  'Puis-je ajouter un conducteur supplémentaire?',
  'Oui, vous pouvez ajouter des conducteurs supplémentaires moyennant des frais. Tous les conducteurs supplémentaires doivent répondre aux mêmes exigences que le conducteur principal (permis valide, au moins 25 ans) et doivent être présents lors de la prise en charge pour présenter leurs documents.',
  'Posso aggiungere un conducente aggiuntivo?',
  'Sì, puoi aggiungere conducenti aggiuntivi a pagamento. Tutti i conducenti aggiuntivi devono soddisfare gli stessi requisiti del conducente principale (patente valida, almeno 25 anni) e devono essere presenti al ritiro per presentare i loro documenti.',
  '¿Puedo agregar un conductor adicional?',
  'Sí, puede agregar conductores adicionales por una tarifa. Todos los conductores adicionales deben cumplir con los mismos requisitos que el conductor principal (licencia válida, al menos 25 años) y deben estar presentes en la recogida para presentar sus documentos.',
  'Pot adăuga un șofer suplimentar?',
  'Da, puteți adăuga șoferi suplimentari contra cost. Toți șoferii suplimentari trebuie să îndeplinească aceleași cerințe ca și șoferul principal (permis valid, cel puțin 25 de ani) și trebuie să fie prezenți la ridicare pentru a prezenta documentele.',
  true,
  3,
  false
);

-- FAQ 4: Cancellation policy
INSERT INTO faqs (question_de, answer_de, question_en, answer_en, question_fr, answer_fr, question_it, answer_it, question_es, answer_es, question_ro, answer_ro, is_popular, display_order, is_hidden)
VALUES (
  'Wie lautet die Stornierungsrichtlinie?',
  'Sie können Ihre Buchung bis zu 48 Stunden vor der geplanten Abholzeit kostenlos stornieren. Bei Stornierungen innerhalb von 48 Stunden wird eine Gebühr von 50% des Gesamtbetrags erhoben. Bei Nichterscheinen wird der volle Betrag berechnet.',
  'What is the cancellation policy?',
  'You can cancel your booking free of charge up to 48 hours before the scheduled pickup time. Cancellations within 48 hours will incur a 50% fee of the total amount. No-shows will be charged the full amount.',
  'Quelle est la politique d''annulation?',
  'Vous pouvez annuler votre réservation gratuitement jusqu''à 48 heures avant l''heure de prise en charge prévue. Les annulations dans les 48 heures entraîneront des frais de 50% du montant total. Les non-présentations seront facturées le montant total.',
  'Qual è la politica di cancellazione?',
  'Puoi cancellare la tua prenotazione gratuitamente fino a 48 ore prima dell''orario di ritiro previsto. Le cancellazioni entro 48 ore comporteranno una commissione del 50% dell''importo totale. Le mancate presentazioni saranno addebitate per l''importo totale.',
  '¿Cuál es la política de cancelación?',
  'Puede cancelar su reserva sin cargo hasta 48 horas antes de la hora de recogida programada. Las cancelaciones dentro de 48 horas incurrirán en una tarifa del 50% del monto total. Las no presentaciones se cobrarán el monto total.',
  'Care este politica de anulare?',
  'Puteți anula rezervarea gratuit cu până la 48 de ore înainte de ora programată de ridicare. Anulările în termen de 48 de ore vor atrage o taxă de 50% din suma totală. Neprezentările vor fi taxate cu suma totală.',
  false,
  4,
  false
);

-- FAQ 5: Automatic transmission
INSERT INTO faqs (question_de, answer_de, question_en, answer_en, question_fr, answer_fr, question_it, answer_it, question_es, answer_es, question_ro, answer_ro, is_popular, display_order, is_hidden)
VALUES (
  'Bieten Sie Fahrzeuge mit Automatikgetriebe an?',
  'Ja, wir haben eine große Auswahl an Fahrzeugen mit Automatikgetriebe in allen Kategorien. Bei der Buchung können Sie gezielt nach Automatikfahrzeugen filtern. Wir empfehlen eine frühzeitige Buchung, da Automatikfahrzeuge sehr beliebt sind.',
  'Do you offer automatic transmission vehicles?',
  'Yes, we have a wide selection of automatic transmission vehicles in all categories. You can filter specifically for automatic vehicles when booking. We recommend booking early as automatic vehicles are very popular.',
  'Proposez-vous des véhicules à transmission automatique?',
  'Oui, nous avons un large choix de véhicules à transmission automatique dans toutes les catégories. Vous pouvez filtrer spécifiquement pour les véhicules automatiques lors de la réservation. Nous recommandons de réserver tôt car les véhicules automatiques sont très populaires.',
  'Offrite veicoli con cambio automatico?',
  'Sì, abbiamo un''ampia selezione di veicoli con cambio automatico in tutte le categorie. Puoi filtrare specificamente per veicoli automatici durante la prenotazione. Consigliamo di prenotare in anticipo poiché i veicoli automatici sono molto popolari.',
  '¿Ofrecen vehículos con transmisión automática?',
  'Sí, tenemos una amplia selección de vehículos con transmisión automática en todas las categorías. Puede filtrar específicamente por vehículos automáticos al reservar. Recomendamos reservar con anticipación ya que los vehículos automáticos son muy populares.',
  'Oferiți vehicule cu transmisie automată?',
  'Da, avem o selecție largă de vehicule cu transmisie automată în toate categoriile. Puteți filtra specific pentru vehicule automate la rezervare. Recomandăm rezervarea din timp deoarece vehiculele automate sunt foarte populare.',
  false,
  5,
  false
);