import React, { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '@theme';

const Input = forwardRef(function Input(
  {
    label,
    prefix,
    error,
    helper,
    style,
    inputStyle,
    ...rest
  },
  ref
) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputBox,
          rest.multiline && styles.inputBoxMultiline,
          error && styles.boxError
        ]}
      >
        {prefix && <View style={styles.prefixWrap}>{prefix}</View>}
        <TextInput
          ref={ref}
          placeholderTextColor={theme.colors.textDim}
          style={[styles.input, rest.multiline && styles.inputMultiline, inputStyle]}
          {...rest}
        />
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.base
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textMain,
    marginBottom: 6
  },
  inputBox: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadius.md,
    backgroundColor: theme.colors.inputBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md
  },
  inputBoxMultiline: {
    alignItems: 'flex-start',
    minHeight: 120,
    paddingVertical: 10
  },
  boxError: {
    borderColor: theme.colors.danger
  },
  prefixWrap: {
    marginRight: 6
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textMain,
    paddingVertical: 10
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 100,
    paddingVertical: 4
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.danger,
    marginTop: 4
  },
  helperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4
  }
});

export default Input;
