import api from "../api";

// Subjects
export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Classes
export interface ClassData {
  id: number;
  name: string;
  class_name?: string;
  major_id?: number;
  homeroom_teacher?: string;
  capacity?: number;
  level?: string;
  academic_year_id?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  major?: any;
}

// Majors
export interface Major {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Rooms
export interface Room {
  id: number;
  name: string;
  code: string;
  capacity?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Academic Years
export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const masterDataService = {
  // Subjects
  subjects: {
    getAll: async () => {
      const response = await api.get("/subjects");
      return response.data.data || response.data || [];
    },
    getMySubjects: async () => {
      // For guru, get only their subjects
      const response = await api.get("/my-subjects");
      return response.data.data || response.data || [];
    },
    getOne: async (id: number) => {
      const response = await api.get(`/subjects/${id}`);
      return response.data;
    },
    create: async (data: Partial<Subject>) => {
      const response = await api.post("/subjects", data);
      return response.data;
    },
    update: async (id: number, data: Partial<Subject>) => {
      const response = await api.put(`/subjects/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/subjects/${id}`);
      return response.data;
    },
  },

  // Classes
  classes: {
    getAll: async () => {
      const response = await api.get("/classes");
      return response.data.data || response.data || [];
    },
    getOne: async (id: number) => {
      const response = await api.get(`/classes/${id}`);
      return response.data;
    },
    create: async (data: Partial<ClassData>) => {
      const response = await api.post("/classes", data);
      return response.data;
    },
    update: async (id: number, data: Partial<ClassData>) => {
      const response = await api.put(`/classes/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/classes/${id}`);
      return response.data;
    },
  },

  // Majors
  majors: {
    getAll: async () => {
      const response = await api.get("/majors");
      return response.data;
    },
    getOne: async (id: number) => {
      const response = await api.get(`/majors/${id}`);
      return response.data;
    },
    create: async (data: Partial<Major>) => {
      const response = await api.post("/majors", data);
      return response.data;
    },
    update: async (id: number, data: Partial<Major>) => {
      const response = await api.put(`/majors/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/majors/${id}`);
      return response.data;
    },
  },

  // Rooms
  rooms: {
    getAll: async () => {
      const response = await api.get("/rooms");
      return response.data;
    },
    getOne: async (id: number) => {
      const response = await api.get(`/rooms/${id}`);
      return response.data;
    },
    create: async (data: Partial<Room>) => {
      const response = await api.post("/rooms", data);
      return response.data;
    },
    update: async (id: number, data: Partial<Room>) => {
      const response = await api.put(`/rooms/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/rooms/${id}`);
      return response.data;
    },
  },

  // Academic Years
  academicYears: {
    getAll: async () => {
      const response = await api.get("/academic-years");
      return response.data;
    },
    getOne: async (id: number) => {
      const response = await api.get(`/academic-years/${id}`);
      return response.data;
    },
    create: async (data: Partial<AcademicYear>) => {
      const response = await api.post("/academic-years", data);
      return response.data;
    },
    update: async (id: number, data: Partial<AcademicYear>) => {
      const response = await api.put(`/academic-years/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/academic-years/${id}`);
      return response.data;
    },
    setActive: async (id: number) => {
      const response = await api.post(`/academic-years/${id}/set-active`);
      return response.data;
    },
  },

  // Teachers
  teachers: {
    getAll: async () => {
      const response = await api.get("/users?role=guru");
      return response.data.data || response.data || [];
    },
    getSubjects: async (teacherId: number) => {
      const response = await api.get(`/users/${teacherId}/subjects`);
      return response.data.data || response.data || [];
    },
  },
};

export default masterDataService;
