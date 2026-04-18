export type Complaint = {
  id: string;
  resident: string;
  village: string;
  issue: string;
  time: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
};

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'Resident' | 'Sarpanch' | 'Inspector';
};

export const getStoredUsers = (): User[] => {
  const users = localStorage.getItem('es_users');
  return users ? JSON.parse(users) : [];
};

export const saveUser = (user: User) => {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem('es_users', JSON.stringify(users));
};

export const setCurrentSession = (user: User) => {
  localStorage.setItem('es_current_user', JSON.stringify(user));
};

export const getCurrentSession = (): User | null => {
  const user = localStorage.getItem('es_current_user');
  return user ? JSON.parse(user) : null;
};

export const clearSession = () => {
  localStorage.removeItem('es_current_user');
};

export const getComplaints = (): Complaint[] => {
  const comp = localStorage.getItem('es_complaints');
  if (comp) return JSON.parse(comp);
  return [
    { id: '1', resident: "Ramubhai Patel", village: "Panoli", issue: "Foul smell from factory near School Rd", time: "2h ago", status: "Pending", severity: "High" },
    { id: '2', resident: "Sushila Desai", village: "Ankleshwar", issue: "Visible smoke from industrial chimney", time: "3h ago", status: "In Progress", severity: "Medium" },
    { id: '3', resident: "Harishbhai Modi", village: "Jhagadia", issue: "Skin rashes reported near Zentis plant", time: "5h ago", status: "Resolved", severity: "Critical" },
    { id: '4', resident: "Kanta Ben", village: "Amod", issue: "Black water discharge near community well", time: "1d ago", status: "Pending", severity: "High" },
  ];
};

export const saveComplaint = (complaint: Complaint) => {
  const complaints = getComplaints();
  complaints.unshift(complaint);
  localStorage.setItem('es_complaints', JSON.stringify(complaints));
};

export const getSarpanchStats = () => {
  const stats = localStorage.getItem('es_sarpanch_stats');
  if (stats) return JSON.parse(stats);
  return { activeSensors: 0, activeFactories: 0 };
};

export const updateSarpanchStats = (updates: Partial<{ activeSensors: number; activeFactories: number }>) => {
  const current = getSarpanchStats();
  const updated = { ...current, ...updates };
  localStorage.setItem('es_sarpanch_stats', JSON.stringify(updated));
  return updated;
};

export const getInspectorStats = () => {
  const stats = localStorage.getItem('es_inspector_stats');
  if (stats) return JSON.parse(stats);
  return { showCauseNotices: 2, shutdowns: 1, renewals: 3, sensorFaults: 0 };
};

export const updateInspectorStats = (updates: Partial<{ showCauseNotices: number; shutdowns: number; renewals: number; sensorFaults: number }>) => {
  const current = getInspectorStats();
  const updated = { ...current, ...updates };
  localStorage.setItem('es_inspector_stats', JSON.stringify(updated));
  return updated;
};

export const getExtendedFactories = () => {
  const factories = localStorage.getItem('es_extended_factories');
  if (factories) return JSON.parse(factories);
  return [
    { id: 'f1', name: 'Apex Chemicals', type: 'Chemical', consent: 'CTE-2024', expiry: '2025-03-01', pm25: 145, so2: 78, nox: 92, compliance: 'Warning', lastInspection: '2024-12-10' },
    { id: 'f2', name: 'Gujarat Paper Mills', type: 'Pulp & Paper', consent: 'CTE-2023', expiry: '2025-07-15', pm25: 62, so2: 22, nox: 38, compliance: 'Good', lastInspection: '2024-11-20' },
    { id: 'f3', name: 'Zentis Pharmaceuticals', type: 'Pharma', consent: 'CTE-2022', expiry: '2024-12-31', pm25: 312, so2: 145, nox: 188, compliance: 'Violation', lastInspection: '2024-09-05' },
  ];
};

export const saveExtendedFactory = (factory: any) => {
  const factories = getExtendedFactories();
  factories.push(factory);
  localStorage.setItem('es_extended_factories', JSON.stringify(factories));
};

export const updateExtendedFactory = (id: string, updates: any) => {
  const factories = getExtendedFactories();
  const idx = factories.findIndex((f: any) => f.id === id);
  if(idx > -1) {
     factories[idx] = { ...factories[idx], ...updates };
     localStorage.setItem('es_extended_factories', JSON.stringify(factories));
  }
};
