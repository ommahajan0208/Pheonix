import { useState } from 'react';
import { Box, Button, Checkbox, Chip, FormControlLabel, MenuItem, TextField, Alert, Tooltip } from '@mui/material';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '../../context/DataContext';
import { ScoringDirection, ThrustArea, UnitOfMeasure } from '../../types';
import { getDefaultScoringDirection, getScoringDirectionLabel } from '../../utils/progressScore';
import { getActiveCycle, getWindowMessage, isPhaseOpen } from '../../utils/cycleSchedule';
import {
  minimumWeightageMessage,
  sharedKpiRecipientRequiredMessage,
  sharedKpiWindowClosedMessage,
} from '../../utils/constraintGuidance';

const THRUST_AREAS: ThrustArea[] = ['Revenue', 'Customer Success', 'Innovation', 'Efficiency', 'Team Development'];
const UNITS: UnitOfMeasure[] = ['Numeric', '%', 'Timeline', 'Zero-based'];

export default function SharedKpiForm() {
  const { teamMembers, cycles, addSharedGoal } = useData();
  const activeCycle = getActiveCycle(cycles);
  const activeCycleId = activeCycle?.id || 'cycle-2026';
  const goalSettingOpen = isPhaseOpen(activeCycle, 'goalSetting');
  const [title, setTitle] = useState('Departmental Delivery KPI');
  const [description, setDescription] = useState('Shared KPI pushed to linked employee goal sheets.');
  const [thrustArea, setThrustArea] = useState<ThrustArea>('Efficiency');
  const [unitOfMeasure, setUnitOfMeasure] = useState<UnitOfMeasure>('%');
  const [scoringDirection, setScoringDirection] = useState<ScoringDirection>('higher-is-better');
  const [target, setTarget] = useState(95);
  const [weightage, setWeightage] = useState(10);
  const [primaryOwnerId, setPrimaryOwnerId] = useState(teamMembers[0]?.id || '');
  const [selectedIds, setSelectedIds] = useState<string[]>(teamMembers.map(member => member.id));
  const [notice, setNotice] = useState('');

  const canPush = goalSettingOpen && title.trim() && description.trim() && primaryOwnerId && selectedIds.length > 0 && weightage >= 10;
  const pushBlockMessage = !goalSettingOpen
    ? sharedKpiWindowClosedMessage
    : selectedIds.length === 0
      ? sharedKpiRecipientRequiredMessage
      : !title.trim()
        ? 'Enter a shared KPI title before pushing.'
        : !description.trim()
          ? 'Enter a shared KPI description before pushing.'
          : !primaryOwnerId
            ? 'Select a primary owner before pushing a shared KPI.'
            : weightage < 10
              ? minimumWeightageMessage
              : '';

  const toggleEmployee = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(employeeId => employeeId !== id) : [...prev, id]);
  };

  const handlePush = () => {
    if (pushBlockMessage) {
      toast.error(pushBlockMessage);
      return;
    }
    addSharedGoal({
      title,
      description,
      thrustArea,
      unitOfMeasure,
      scoringDirection,
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
      <Alert severity={goalSettingOpen ? 'success' : 'info'} sx={{ mb: 2 }}>
        {getWindowMessage(activeCycle, 'goalSetting')} Shared KPIs can be pushed only during goal setting.
      </Alert>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        <TextField id="shared-kpi-title" name="sharedKpiTitle" label="Shared KPI Title" size="small" value={title} onChange={(event) => setTitle(event.target.value)} />
        <TextField id="shared-kpi-thrust-area" name="sharedKpiThrustArea" select label="Thrust Area" size="small" value={thrustArea} onChange={(event) => setThrustArea(event.target.value as ThrustArea)}>
          {THRUST_AREAS.map(area => <MenuItem key={area} value={area}>{area}</MenuItem>)}
        </TextField>
        <TextField id="shared-kpi-primary-owner" name="sharedKpiPrimaryOwner" select label="Primary Owner" size="small" value={primaryOwnerId} onChange={(event) => setPrimaryOwnerId(event.target.value)}>
          {teamMembers.map(member => <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>)}
        </TextField>
      </Box>

      <TextField
        label="Description"
        id="shared-kpi-description"
        name="sharedKpiDescription"
        size="small"
        fullWidth
        multiline
        rows={2}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        <TextField
          select
          id="shared-kpi-uom"
          name="sharedKpiUom"
          label="UoM"
          size="small"
          value={unitOfMeasure}
          onChange={(event) => {
            const nextUnit = event.target.value as UnitOfMeasure;
            setUnitOfMeasure(nextUnit);
            setScoringDirection(getDefaultScoringDirection(nextUnit));
          }}
        >
          {UNITS.map(unit => <MenuItem key={unit} value={unit}>{unit}</MenuItem>)}
        </TextField>
        <TextField
          select
          id="shared-kpi-scoring"
          name="sharedKpiScoring"
          label="Scoring"
          size="small"
          value={scoringDirection}
          disabled={unitOfMeasure === 'Timeline' || unitOfMeasure === 'Zero-based'}
          onChange={(event) => setScoringDirection(event.target.value as ScoringDirection)}
        >
          {(['higher-is-better', 'lower-is-better', 'date-based', 'zero-success'] as ScoringDirection[])
            .filter(direction => unitOfMeasure === 'Timeline' || unitOfMeasure === 'Zero-based'
              ? direction === getDefaultScoringDirection(unitOfMeasure)
              : direction === 'higher-is-better' || direction === 'lower-is-better')
            .map(direction => <MenuItem key={direction} value={direction}>{getScoringDirectionLabel(direction)}</MenuItem>)}
        </TextField>
        <TextField id="shared-kpi-target" name="sharedKpiTarget" label="Target" type="number" size="small" value={target} onChange={(event) => setTarget(Number(event.target.value))} />
        <TextField id="shared-kpi-default-weightage" name="sharedKpiDefaultWeightage" label="Default Weightage (%)" type="number" size="small" value={weightage} inputProps={{ min: 10 }} onChange={(event) => setWeightage(Number(event.target.value))} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>Recipients</Box>
        {selectedIds.length === 0 && (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            {sharedKpiRecipientRequiredMessage}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {teamMembers.map(member => (
            <FormControlLabel
              key={member.id}
              control={<Checkbox checked={selectedIds.includes(member.id)} onChange={() => toggleEmployee(member.id)} size="small" inputProps={{ id: `shared-kpi-recipient-${member.id}`, name: 'sharedKpiRecipients', 'aria-label': `Select ${member.name}` }} />}
              label={<Chip label={member.name} size="small" variant={selectedIds.includes(member.id) ? 'filled' : 'outlined'} />}
            />
          ))}
        </Box>
      </Box>

      <Tooltip title={pushBlockMessage}>
        <span>
          <Button
            variant="contained"
            startIcon={<Share2 size={18} />}
            onClick={handlePush}
            aria-disabled={!canPush}
            sx={!canPush ? { opacity: 0.65 } : undefined}
          >
            Push Shared KPI
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
}
