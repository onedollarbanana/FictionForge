// Shared types for experience system - NO "use client" directive
// This file can be imported by both server and client components

export type ExperienceTier = 
  | 'newcomer' 
  | 'reader' 
  | 'regular'
  | 'contributor' 
  | 'veteran' 
  | 'master'
  | 'legend'
  | 'elite'
  | 'mythic'
