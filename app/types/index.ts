export interface Client {
  _id: string;
  designerId: string;
  name: string;
  email?: string;
  phone?: string;
  gender: 'male' | 'female' | 'other';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Measurement {
  _id: string;
  clientId: string;
  clothingType: string;
  measurements: { [key: string]: number };
  unit: 'inches' | 'cm';
  notes?: string;
  createdAt: Date;
}

export interface MeasurementField {
  label: string;
  key: string;
}

export const clothingTypes = {
  male: [
    { value: 'shirt', label: 'Shirt' },
    { value: 'trouser', label: 'Trouser' },
    { value: 'suit', label: 'Suit' },
    { value: 'traditional', label: 'Traditional Wear' },
  ],
  female: [
    { value: 'blouse', label: 'Blouse' },
    { value: 'skirt', label: 'Skirt' },
    { value: 'dress', label: 'Dress' },
    { value: 'gown', label: 'Gown' },
    { value: 'traditional', label: 'Traditional Wear' },
  ],
  other: [
    { value: 'shirt', label: 'Shirt' },
    { value: 'trouser', label: 'Trouser' },
    { value: 'dress', label: 'Dress' },
    { value: 'traditional', label: 'Traditional Wear' },
  ],
};

export const measurementFields: { [key: string]: MeasurementField[] } = {
  shirt: [
    { label: 'Neck', key: 'neck' },
    { label: 'Chest', key: 'chest' },
    { label: 'Waist', key: 'waist' },
    { label: 'Shoulder', key: 'shoulder' },
    { label: 'Sleeve Length', key: 'sleeveLength' },
    { label: 'Shirt Length', key: 'shirtLength' },
  ],
  trouser: [
    { label: 'Waist', key: 'waist' },
    { label: 'Hips', key: 'hips' },
    { label: 'Thigh', key: 'thigh' },
    { label: 'Inseam', key: 'inseam' },
    { label: 'Outseam', key: 'outseam' },
    { label: 'Crotch', key: 'crotch' },
  ],
  suit: [
    { label: 'Chest', key: 'chest' },
    { label: 'Waist', key: 'waist' },
    { label: 'Shoulder', key: 'shoulder' },
    { label: 'Sleeve Length', key: 'sleeveLength' },
    { label: 'Jacket Length', key: 'jacketLength' },
    { label: 'Trouser Waist', key: 'trouserWaist' },
    { label: 'Inseam', key: 'inseam' },
  ],
  blouse: [
    { label: 'Bust', key: 'bust' },
    { label: 'Waist', key: 'waist' },
    { label: 'Shoulder', key: 'shoulder' },
    { label: 'Sleeve Length', key: 'sleeveLength' },
    { label: 'Blouse Length', key: 'blouseLength' },
    { label: 'Arm Hole', key: 'armHole' },
  ],
  skirt: [
    { label: 'Waist', key: 'waist' },
    { label: 'Hips', key: 'hips' },
    { label: 'Skirt Length', key: 'skirtLength' },
  ],
  dress: [
    { label: 'Bust', key: 'bust' },
    { label: 'Waist', key: 'waist' },
    { label: 'Hips', key: 'hips' },
    { label: 'Shoulder', key: 'shoulder' },
    { label: 'Sleeve Length', key: 'sleeveLength' },
    { label: 'Dress Length', key: 'dressLength' },
  ],
  gown: [
    { label: 'Bust', key: 'bust' },
    { label: 'Waist', key: 'waist' },
    { label: 'Hips', key: 'hips' },
    { label: 'Shoulder', key: 'shoulder' },
    { label: 'Sleeve Length', key: 'sleeveLength' },
    { label: 'Gown Length', key: 'gownLength' },
    { label: 'Train Length', key: 'trainLength' },
  ],
  traditional: [
    { label: 'Chest/Bust', key: 'chest' },
    { label: 'Waist', key: 'waist' },
    { label: 'Shoulder', key: 'shoulder' },
    { label: 'Sleeve Length', key: 'sleeveLength' },
    { label: 'Length', key: 'length' },
  ],
};