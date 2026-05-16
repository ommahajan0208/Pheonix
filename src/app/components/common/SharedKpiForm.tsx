import { useState } from 'react';
import { Box, Button, Checkbox, Chip, FormControlLabel, MenuItem, TextField, Alert } from '@mui/material';
import { Share2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ThrustArea, UnitOfMeasure } from '../../types';

const THRUST_AREAS: ThrustArea[] = ['Revenue', 'Customer Success', 'Innovation', 'Efficiency', 'Team Development'];
const UNITS: UnitOfMeasure[] = ['Numeric', '%', 'Timeline', 'Zero-based'];

export default function SharedKpiForm() {
  const { teamMembers, cycles, addSharedGoal } = useData();
  const activeCycleId = cycles.find(cycle => cycle.isActive)?.id || cycles[0]?.id || 'cycle-2026';
  const [title, setTitle] = useState('Departmental Delivery KPI');
  const [description, setDescription] = useState('Shared KPI pushed to linked employee goal sheets.');
  const [thrustArea, setThrustArea] = useState<ThrustArea>('Efficiency');
  const [unitOfMeasure, setUnitOfMeasure] = useState<UnitOfMeasure>('%');
  const [target, setTarget] = useState(95);
  const [weightage, setWeightage] = useState(10);
  const [primaryOwnerId, setPrimaryOwnerId] = useState(teamMembers[0]?.id || '');
  const [selectedIds, setSelectedIds] = useState<string[]>(teamMembers.map(member => member.id));
  const [notice, setNotice] = useState('');

  const canPush = title.trim() && description.trim() && primaryOwnerId && selectedIds.length > 0 && weightage >= 10;

  const toggleEmployee = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(employeeId => employeeId !== id) : [...prev, id]);
  };

  const handlePush = () => {
    if (!canPush) return;
    addSharedGoal({
      title,
      description,
      thrustArea,
      unitOfMeasure,
      target,
      weightage,
      cycleId: activeCycleId,
      primaryOwnerId,
      deadlineDate: new Date('2026-12-31'),
    }, selectedIds, primaryOwnerId);
    setNotice(`Shared KPI pushed to ${new Set([primaryOwnerId, ...selectedIds]).size} employee goal sheets.`);
  };

  return (
    <Box>
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        <TextField label="Shared KPI Title" size="small" value={title} onChange={(event) => setTitle(event.target.value)} />
        <TextField select label="Thrust Area" size="small" value={thrustArea} onChange={(event) => setThrustArea(event.target.value as ThrustArea)}>
          {THRUST_AREAS.map(area => <MenuItem key={area} value={area}>{area}</MenuItem>)}
        </TextField>
        <TextField select label="Primary Owner" size="small" value={primaryOwnerId} onChange={(event) => setPrimaryOwnerId(event.target.value)}>
          {teamMembers.map(member => <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>)}
        </TextField>
      </Box>

      <TextField
        label="Description"
        size="small"
        fullWidth
        multiline
        rows={2}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        <TextField select label="UoM" size="small" value={unitOfMeasure} onChange={(event) => setUnitOfMeasure(event.target.value as UnitOfMeasure)}>
          {UNITS.map(unit => <MenuItem key={unit} value={unit}>{unit}</MenuItem>)}
        </TextField>
        <TextField label="Target" type="number" size="small" value={target} onChange={(event) => setTarget(Number(event.target.value))} />
        <TextField label="Default Weightage (%)" type="number" size="small" value={weightage} inputProps={{ min: 10 }} onChange={(event) => setWeightage(Number(event.target.value))} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>Recipients</Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {teamMembers.map(member => (
            <FormControlLabel
              key={member.id}
              control={<Checkbox checked={selectedIds.includes(member.id)} onChange={() => toggleEmployee(member.id)} size="small" />}
              label={<Chip label={member.name} size="small" variant={selectedIds.includes(member.id) ? 'filled' : 'outlined'} />}
            />
          ))}
        </Box>
      </Box>

      <Button variant="contained" startIcon={<Share2 size={18} />} onClick={handlePush} disabled={!canPush}>
        Push Shared KPI
      </Button>
    </Box>
  );
}
