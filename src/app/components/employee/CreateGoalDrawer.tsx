import { useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  Box,
  Button,
  TextField,
  MenuItem,
  Slider,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import { X, Save } from 'lucide-react';
import { ThrustArea, UnitOfMeasure, Goal, ScoringDirection } from '../../types';
import { getDefaultScoringDirection, getScoringDirectionLabel } from '../../utils/progressScore';
import { minimumWeightageMessage } from '../../utils/constraintGuidance';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface CreateGoalDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (goal: Partial<Goal>) => void;
  existingGoal?: Goal;
  totalWeightage: number;
}

const THRUST_AREAS: ThrustArea[] = ['Revenue', 'Customer Success', 'Innovation', 'Efficiency', 'Team Development'];
const UNITS: UnitOfMeasure[] = ['Numeric', '%', 'Timeline', 'Zero-based'];

const DEFAULT_GOAL: Partial<Goal> = {
  title: '',
  description: '',
  thrustArea: 'Efficiency',
  unitOfMeasure: '%',
  scoringDirection: 'higher-is-better',
  target: 0,
  weightage: 10,
  deadlineDate: undefined,
};

export default function CreateGoalDrawer({ open, onClose, onSave, existingGoal, totalWeightage }: CreateGoalDrawerProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Goal>>(existingGoal || DEFAULT_GOAL);

  const remainingWeightage = 100 - totalWeightage + (existingGoal?.weightage || 0);
  const isSharedRecipient = Boolean(existingGoal?.isShared && existingGoal.employeeId !== existingGoal.primaryOwnerId);
  const nextTotalWeightage = totalWeightage - (existingGoal?.weightage || 0) + (formData.weightage || 0);
  const directionLocked = formData.unitOfMeasure === 'Timeline' || formData.unitOfMeasure === 'Zero-based';
  const weightageTooLow = Number(formData.weightage || 0) < 10;

  useEffect(() => {
    if (open) {
      setFormData(existingGoal || DEFAULT_GOAL);
      setActiveStep(0);
    }
  }, [existingGoal, open]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!formData.title?.trim()) errors.push('Goal title is required.');
    if (!formData.description?.trim()) errors.push('Description is required.');
    if (!formData.thrustArea) errors.push('Thrust area is required.');
    if (!formData.unitOfMeasure) errors.push('Unit of measure is required.');
    if (typeof formData.target !== 'number' || Number.isNaN(formData.target)) errors.push('Target must be a valid value.');
    if (!formData.weightage || formData.weightage < 10) errors.push(minimumWeightageMessage);
    if (nextTotalWeightage > 100) errors.push('Total sheet weightage cannot exceed 100%.');
    return errors;
  }, [formData, nextTotalWeightage]);

  const canSave = validationErrors.length === 0;

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, 2));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave(formData);
    onClose();
    setActiveStep(0);
  };

  const steps = ['Basic Info', 'Metrics', 'Timeline'];

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 500, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ fontSize: 20, fontWeight: 700 }}>
            {existingGoal ? 'Edit Goal' : 'Create New Goal'}
          </Box>
          <IconButton onClick={onClose}>
            <X size={20} />
          </IconButton>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <TextField
              select
              fullWidth
              id="goal-thrust-area"
              name="goalThrustArea"
              label="Thrust Area"
              value={formData.thrustArea}
              onChange={(e) => setFormData({ ...formData, thrustArea: e.target.value as ThrustArea })}
              sx={{ mb: 3 }}
              disabled={isSharedRecipient}
            >
              {THRUST_AREAS.map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              id="goal-title"
              name="goalTitle"
              label="Goal Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 3 }}
              placeholder="e.g., Increase API Response Time by 25%"
              disabled={isSharedRecipient}
            />

            <TextField
              fullWidth
              id="goal-description"
              name="goalDescription"
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal and how you plan to achieve it..."
              disabled={isSharedRecipient}
            />
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ fontSize: 14, fontWeight: 600, mb: 1.5 }}>Unit of Measure</Box>
              <ToggleButtonGroup
                aria-label="Unit of measure"
                value={formData.unitOfMeasure}
                exclusive
                onChange={(_, value) => value && setFormData({
                  ...formData,
                  unitOfMeasure: value,
                  scoringDirection: getDefaultScoringDirection(value),
                })}
                fullWidth
                size="small"
                disabled={isSharedRecipient}
              >
                {UNITS.map((unit) => (
                  <ToggleButton key={unit} value={unit} sx={{ textTransform: 'none', fontSize: 12 }}>
                    {unit}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <TextField
              select
              fullWidth
              id="goal-scoring-direction"
              name="goalScoringDirection"
              label="Scoring Direction"
              value={formData.scoringDirection || getDefaultScoringDirection(formData.unitOfMeasure || '%')}
              onChange={(e) => setFormData({ ...formData, scoringDirection: e.target.value as ScoringDirection })}
              sx={{ mb: 3 }}
              disabled={isSharedRecipient || directionLocked}
            >
              {(['higher-is-better', 'lower-is-better', 'date-based', 'zero-success'] as ScoringDirection[])
                .filter(direction => !directionLocked || direction === getDefaultScoringDirection(formData.unitOfMeasure || '%'))
                .map(direction => (
                  <MenuItem key={direction} value={direction}>
                    {getScoringDirectionLabel(direction)}
                  </MenuItem>
                ))}
            </TextField>

            <TextField
              fullWidth
              id="goal-target-value"
              name="goalTargetValue"
              type="number"
              label="Target Value"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
              sx={{ mb: 3 }}
              disabled={isSharedRecipient}
            />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ fontSize: 14, fontWeight: 600 }}>Weightage</Box>
                <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
                  Remaining: {remainingWeightage}%
                </Box>
              </Box>
              <Slider
                aria-label="Goal weightage"
                name="goalWeightage"
                value={formData.weightage || 0}
                onChange={(_, value) => setFormData({ ...formData, weightage: value as number })}
                min={0}
                max={Math.max(10, Math.min(remainingWeightage, 100))}
                step={5}
                marks
                valueLabelDisplay="on"
                sx={{ mt: 3 }}
              />
              {weightageTooLow && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {minimumWeightageMessage}
                </Alert>
              )}
            </Box>

            <Box
              sx={{
                p: 2,
                bgcolor: canSave ? '#e8f5e9' : '#ffebee',
                borderRadius: 1,
                fontSize: 13,
              }}
            >
              Current weightage: <strong>{formData.weightage}%</strong> |
              After save: <strong>{nextTotalWeightage}%</strong>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Deadline Date"
                value={formData.deadlineDate}
                onChange={(date) => setFormData({ ...formData, deadlineDate: date || undefined })}
                slotProps={{ textField: { fullWidth: true, id: 'goal-deadline-date', name: 'goalDeadlineDate' } }}
              />
            </LocalizationProvider>

            {validationErrors.length > 0 && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                {validationErrors.map((error) => (
                  <Box key={error} sx={{ fontSize: 13 }}>{error}</Box>
                ))}
              </Alert>
            )}

            <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Box sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>Goal Summary</Box>
              <Box sx={{ fontSize: 13, mb: 1 }}>
                <strong>Title:</strong> {formData.title || 'Not set'}
              </Box>
              <Box sx={{ fontSize: 13, mb: 1 }}>
                <strong>Thrust Area:</strong> {formData.thrustArea}
              </Box>
              <Box sx={{ fontSize: 13, mb: 1 }}>
                <strong>Target:</strong> {formData.target} {formData.unitOfMeasure}
              </Box>
              <Box sx={{ fontSize: 13, mb: 1 }}>
                <strong>Scoring:</strong> {getScoringDirectionLabel(formData.scoringDirection || getDefaultScoringDirection(formData.unitOfMeasure || '%'))}
              </Box>
              <Box sx={{ fontSize: 13 }}>
                <strong>Weightage:</strong> {formData.weightage}%
              </Box>
            </Box>

            <Box sx={{ mt: 3, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1, fontSize: 12, color: '#1976d2' }}>
              Auto-save enabled. Draft changes are captured in this prototype while the drawer is open.
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            fullWidth
          >
            Back
          </Button>
          {activeStep < 2 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              fullWidth
              disabled={!formData.title || !formData.description}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSave}
              startIcon={<Save size={18} />}
              fullWidth
              disabled={!canSave}
            >
              Save Goal
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
