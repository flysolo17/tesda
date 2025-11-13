import { Injectable } from '@angular/core';
import { Survey, SurveyConverter } from '../models/Survey';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private readonly SURVEY_COLLECTION = 'surveys';
  constructor(private firestore: Firestore) {}

  create(survey: Survey) {
    const collectionRef = collection(this.firestore, this.SURVEY_COLLECTION);
    const docRef = doc(collectionRef);
    survey.id = docRef.id;

    return setDoc(docRef, survey);
  }

  async checkIfSubmitted(userId: string): Promise<boolean> {
    const q = query(
      collection(this.firestore, this.SURVEY_COLLECTION).withConverter(
        SurveyConverter
      ),
      where('uid', '==', userId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }
  getAll(): Observable<Survey[]> {
    const q = query(
      collection(this.firestore, this.SURVEY_COLLECTION).withConverter(
        SurveyConverter
      )
    );
    return collectionData(q);
  }
}
