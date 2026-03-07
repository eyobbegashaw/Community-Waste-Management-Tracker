import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';


import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, // አዲስ ተጠቃሚ ለመመዝገብ ይጠቅማል
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';


import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { db, storage, auth } from './config';

// ============= Auth Services (አዲስ የተጨመረ) =============
export const authService = {
  // በ Google ለመግባት
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // ተጠቃሚው ገብቶ ሲያበቃ መረጃውን Firestore ውስጥ እናስቀምጣለን
      await this.saveUserToFirestore(user);
      
      return user;
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error;
    }
  },

  // ተጠቃሚው መጀመሪያ ሲገባ መረጃውን Save ለማድረግ
  async saveUserToFirestore(user) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // ተጠቃሚው አዲስ ከሆነ ብቻ ነው የምንፈጥረው
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: 'citizen', // በዲፎልት ተራ ተጠቃሚ ይሆናል
        createdAt: serverTimestamp(),
        preferredLanguage: 'am'
      });
    }
  },

  // ለመውጣት (Logout)
  async logout() {
    await signOut(auth);
  }
};
// ============= Report Services =============
export const reportService = {
  // Create new report with image
  async createReport(reportData, imageFile) {
    try {
      // Upload image first
      const imageUrl = await this.uploadReportImage(imageFile);
      
      // Create report document
      const reportRef = await addDoc(collection(db, 'reports'), {
        ...reportData,
        imageUrl,
        createdAt: serverTimestamp(),
        status: 'new',
        userId: auth.currentUser?.uid
      });
      
      return { id: reportRef.id, success: true };
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  // Upload image to Firebase Storage
  async uploadReportImage(file) {
    const fileName = `reports/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    
    return downloadUrl;
  },

  // Get all reports with optional filters
  async getReports(filters = {}) {
    let q = collection(db, 'reports');
    let constraints = [orderBy('createdAt', 'desc')];
    
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }
    
    const queryRef = query(q, ...constraints);
    const snapshot = await getDocs(queryRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  },

  // Update report status
  async updateReportStatus(reportId, status) {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      status,
      ...(status === 'resolved' && { resolvedAt: serverTimestamp() })
    });
    
    // Trigger notification
    await this.sendStatusNotification(reportId, status);
    
    return { success: true };
  },

  // Send notification on status change
  async sendStatusNotification(reportId, status) {
    const report = await getDoc(doc(db, 'reports', reportId));
    const reportData = report.data();
    
    // In a production app, you'd integrate with an SMS service like Africa's Talking
    console.log(`SMS sent to ${reportData.userPhone}: Your report status is now ${status}`);
  },

  // Delete report and its image
  async deleteReport(reportId, imageUrl) {
    // Delete image from storage
    if (imageUrl) {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    }
    
    // Delete report document
    await deleteDoc(doc(db, 'reports', reportId));
    
    return { success: true };
  }
};

// ============= Schedule Services =============
export const scheduleService = {
  // Get all collection schedules
  async getSchedules() {
    const snapshot = await getDocs(collection(db, 'schedules'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Update schedule
  async updateSchedule(scheduleId, data) {
    const scheduleRef = doc(db, 'schedules', scheduleId);
    await updateDoc(scheduleRef, {
      ...data,
      lastUpdated: serverTimestamp()
    });
    
    return { success: true };
  },

  // Add new schedule
  async addSchedule(data) {
    const docRef = await addDoc(collection(db, 'schedules'), {
      ...data,
      lastUpdated: serverTimestamp()
    });
    
    return { id: docRef.id, success: true };
  }
};

// ============= User Services =============
export const userService = {
  // Create or update user profile
  async updateUserProfile(userId, data) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  },

  // Get user by ID
  async getUser(userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  },

  // Check if user is admin
  async isAdmin(userId) {
    const user = await this.getUser(userId);
    return user?.role === 'admin';
  }
};