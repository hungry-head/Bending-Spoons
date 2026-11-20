import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { palette, radius, space, typography } from '../theme/tokens';

type TextFieldProps = TextInputProps & {
  icon?: LucideIcon;
  containerStyle?: ViewStyle;
};

export function TextField({ icon: Icon, multiline, editable = true, containerStyle, style, ...props }: TextFieldProps) {
  return <View style={[styles.field, multiline && styles.multiline, !editable && styles.disabled, containerStyle]}>
    {Icon ? <Icon size={20} color={editable ? palette.sky : palette.inkSoft} strokeWidth={1.8} /> : null}
    <TextInput
      {...props}
      editable={editable}
      multiline={multiline}
      placeholderTextColor="#8C98A6"
      style={[styles.input, multiline && styles.multilineInput, style]}
    />
  </View>;
}

const styles = StyleSheet.create({
  field: { minHeight: 54, borderRadius: radius.xl, borderWidth: 1.2, borderColor: palette.inkSoft, backgroundColor: palette.surface, paddingHorizontal: space.md, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  input: { flex: 1, minWidth: 0, color: palette.ink, paddingVertical: 0, ...typography.body },
  multiline: { minHeight: 82, alignItems: 'flex-start', paddingTop: space.sm },
  multilineInput: { minHeight: 56, textAlignVertical: 'top' },
  disabled: { borderColor: 'transparent', backgroundColor: palette.surfaceMuted },
});
