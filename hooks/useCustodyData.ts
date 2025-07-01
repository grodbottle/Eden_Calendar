
import { useState, useEffect, useCallback } from 'react';
import { CustodyData, Custodian } from '../types';

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

const getCleanedData = (data: CustodyData, dateKey: string): CustodyData => {
    const day = data[dateKey];
    if (day && day.custodian === Custodian.Unassigned && (!day.notes || day.notes.trim() === '')) {
        const newData = { ...data };
        delete newData[dateKey];
        return newData;
    }
    return data;
};

export const useCustodyData = (username: string | null) => {
  const [data, setData] = useState<CustodyData>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const debouncedSave = useCallback(debounce(async (userData: CustodyData, user: string) => {
    if (!user) return;
    try {
      await fetch(`/api/data?username=${user}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error("Failed to save data to server", error);
    }
  }, 1000), []);

  useEffect(() => {
    if (username) {
      setIsLoaded(false);
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/data?username=${username}`);
          if (response.ok) {
            const serverData = await response.json();
            setData(serverData || {});
          } else {
            console.error('Failed to fetch data');
            setData({});
          }
        } catch (error) {
          console.error("Failed to connect to server for data fetching", error);
          setData({});
        } finally {
          setIsLoaded(true);
        }
      };
      fetchData();
    } else {
      setData({});
      setIsLoaded(false);
    }
  }, [username]);

  const updateDayCustodian = useCallback((dateKey: string) => {
    if (!username) return;
    setData(prevData => {
      const currentDay = prevData[dateKey] || { custodian: Custodian.Unassigned };
      const newCustodian =
        currentDay.custodian === Custodian.Unassigned ? Custodian.Connar
        : currentDay.custodian === Custodian.Connar ? Custodian.Emma
        : Custodian.Unassigned;
      const newData = { ...prevData, [dateKey]: { ...currentDay, custodian: newCustodian }};
      const cleanedData = getCleanedData(newData, dateKey);
      debouncedSave(cleanedData, username);
      return cleanedData;
    });
  }, [username, debouncedSave]);

  const updateDayNotes = useCallback((dateKey: string, notes: string) => {
    if (!username) return;
    setData(prevData => {
      const currentDay = prevData[dateKey] || { custodian: Custodian.Unassigned };
      const newNotes = notes.trim();
      const updatedDay = { ...currentDay, notes: newNotes };
      const newData = { ...prevData, [dateKey]: updatedDay };
      const cleanedData = getCleanedData(newData, dateKey);
      debouncedSave(cleanedData, username);
      return cleanedData;
    });
  }, [username, debouncedSave]);

  return { custodyData: data, updateDayCustodian, updateDayNotes, isLoaded };
};