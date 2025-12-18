import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Switch,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeProvider, useTheme } from '../theme';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { Button, Text, Card, Input, ProgressBar } from '../components';

const { width } = Dimensions.get('window');

// ============================================
// DESIGN PREVIEW SCREEN
// ============================================

const DesignPreviewContent: React.FC = () => {
    const { theme, isDark, toggleTheme } = useTheme();
    const [inputValue, setInputValue] = useState('');

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text variant="h2" weight="bold">Design Preview</Text>
                <View style={styles.themeSwitch}>
                    <Text variant="bodySmall">Light</Text>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: colors.neutral[300], true: colors.primary[400] }}
                        thumbColor={colors.neutral[0]}
                    />
                    <Text variant="bodySmall">Dark</Text>
                </View>
            </View>

            {/* ========================================== */}
            {/* SECTION 1: COLOR PALETTE */}
            {/* ========================================== */}
            <View style={styles.section}>
                <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
                    1. Farbpalette
                </Text>

                {/* Primary Colors */}
                <Text variant="bodySmall" weight="medium" color={theme.colors.textSecondary}>
                    Primary (Sage Green)
                </Text>
                <View style={styles.colorRow}>
                    {[50, 100, 200, 300, 400, 500, 600, 700].map((shade) => (
                        <View
                            key={shade}
                            style={[
                                styles.colorSwatch,
                                { backgroundColor: colors.primary[shade as keyof typeof colors.primary] }
                            ]}
                        >
                            <Text variant="caption" color={shade < 400 ? '#333' : '#FFF'}>{shade}</Text>
                        </View>
                    ))}
                </View>

                {/* Neutral Colors */}
                <Text variant="bodySmall" weight="medium" color={theme.colors.textSecondary} style={{ marginTop: spacing.md }}>
                    Neutral
                </Text>
                <View style={styles.colorRow}>
                    {[0, 50, 100, 200, 400, 600, 800, 900].map((shade) => (
                        <View
                            key={shade}
                            style={[
                                styles.colorSwatch,
                                { backgroundColor: colors.neutral[shade as keyof typeof colors.neutral] }
                            ]}
                        >
                            <Text variant="caption" color={shade < 400 ? '#333' : '#FFF'}>{shade}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* ========================================== */}
            {/* SECTION 2: GRADIENTS */}
            {/* ========================================== */}
            <View style={styles.section}>
                <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
                    2. Gradients
                </Text>

                <Text variant="bodySmall" color={theme.colors.textSecondary}>Sage Gradients (für Buttons)</Text>
                <View style={styles.gradientRow}>
                    <View style={styles.gradientItem}>
                        <LinearGradient colors={colors.gradients.sage1} style={styles.gradientBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text variant="caption" color="#FFF">Sage 1</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.gradientItem}>
                        <LinearGradient colors={colors.gradients.sage2} style={styles.gradientBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text variant="caption" color="#FFF">Sage 2</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.gradientItem}>
                        <LinearGradient colors={colors.gradients.sage3} style={styles.gradientBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text variant="caption" color="#FFF">Sage 3</Text>
                        </LinearGradient>
                    </View>
                </View>

                <Text variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: spacing.md }}>Premium Gradients</Text>
                <View style={styles.gradientRow}>
                    <View style={styles.gradientItem}>
                        <LinearGradient colors={colors.gradients.premium1} style={styles.gradientBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text variant="caption" color="#FFF">Premium 1</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.gradientItem}>
                        <LinearGradient colors={colors.gradients.premium2} style={styles.gradientBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text variant="caption" color="#FFF">Premium 2</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.gradientItem}>
                        <LinearGradient colors={colors.gradients.premium3} style={styles.gradientBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text variant="caption" color="#FFF">Premium 3</Text>
                        </LinearGradient>
                    </View>
                </View>

                <Text variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: spacing.md }}>Subtle Gradients (für Hintergründe)</Text>
                <View style={styles.gradientRow}>
                    <View style={styles.gradientItem}>
                        <LinearGradient colors={colors.gradients.subtle1} style={[styles.gradientBox, { borderWidth: 1, borderColor: theme.colors.border }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text variant="caption">Subtle 1</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.gradientItem}>
                        <LinearGradient colors={colors.gradients.subtle2} style={[styles.gradientBox, { borderWidth: 1, borderColor: theme.colors.border }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text variant="caption">Subtle 2</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.gradientItem}>
                        <LinearGradient colors={colors.gradients.subtle3} style={[styles.gradientBox, { borderWidth: 1, borderColor: theme.colors.border }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text variant="caption">Subtle 3</Text>
                        </LinearGradient>
                    </View>
                </View>
            </View>

            {/* ========================================== */}
            {/* SECTION 3: TYPOGRAPHY */}
            {/* ========================================== */}
            <View style={styles.section}>
                <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
                    3. Typography
                </Text>

                <Text variant="h1" weight="bold">H1 Bold</Text>
                <Text variant="h2" weight="semibold">H2 Semibold</Text>
                <Text variant="h3" weight="medium">H3 Medium</Text>
                <Text variant="h4">H4 Regular</Text>
                <Text variant="body">Body - Lorem ipsum dolor sit amet</Text>
                <Text variant="bodySmall" color={theme.colors.textSecondary}>Body Small - Secondary text</Text>
                <Text variant="caption" color={theme.colors.textTertiary}>Caption - Tertiary text</Text>
                <Text variant="label" color={theme.colors.textSecondary}>LABEL TEXT</Text>
            </View>

            {/* ========================================== */}
            {/* SECTION 4: BUTTONS */}
            {/* ========================================== */}
            <View style={styles.section}>
                <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
                    4. Buttons
                </Text>

                <Text variant="bodySmall" color={theme.colors.textSecondary}>Primary (Gradient Variationen)</Text>
                <View style={styles.buttonRow}>
                    <Button title="Gradient 1" onPress={() => { }} gradientIndex={1} />
                    <Button title="Gradient 2" onPress={() => { }} gradientIndex={2} />
                    <Button title="Gradient 3" onPress={() => { }} gradientIndex={3} />
                </View>

                <Text variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: spacing.md }}>Sizes</Text>
                <View style={styles.buttonRow}>
                    <Button title="Small" onPress={() => { }} size="sm" />
                    <Button title="Medium" onPress={() => { }} size="md" />
                    <Button title="Large" onPress={() => { }} size="lg" />
                </View>

                <Text variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: spacing.md }}>Variants</Text>
                <View style={styles.buttonColumn}>
                    <Button title="Primary" onPress={() => { }} variant="primary" fullWidth />
                    <Button title="Secondary" onPress={() => { }} variant="secondary" fullWidth />
                    <Button title="Outline" onPress={() => { }} variant="outline" fullWidth />
                    <Button title="Ghost" onPress={() => { }} variant="ghost" fullWidth />
                </View>

                <Text variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: spacing.md }}>States</Text>
                <View style={styles.buttonRow}>
                    <Button title="Disabled" onPress={() => { }} disabled />
                    <Button title="Loading" onPress={() => { }} loading />
                </View>
            </View>

            {/* ========================================== */}
            {/* SECTION 5: CARDS */}
            {/* ========================================== */}
            <View style={styles.section}>
                <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
                    5. Cards
                </Text>

                <Card variant="elevated" style={styles.cardDemo}>
                    <Text variant="body" weight="medium">Elevated Card</Text>
                    <Text variant="caption" color={theme.colors.textSecondary}>Mit Schatten</Text>
                </Card>

                <Card variant="outlined" style={styles.cardDemo}>
                    <Text variant="body" weight="medium">Outlined Card</Text>
                    <Text variant="caption" color={theme.colors.textSecondary}>Mit Border</Text>
                </Card>

                <Card variant="filled" style={styles.cardDemo}>
                    <Text variant="body" weight="medium">Filled Card</Text>
                    <Text variant="caption" color={theme.colors.textSecondary}>Gefüllter Hintergrund</Text>
                </Card>

                <Text variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: spacing.md }}>Gradient Cards</Text>
                <Card variant="gradient" gradientIndex={1} style={styles.cardDemo}>
                    <Text variant="body" weight="medium">Gradient 1</Text>
                </Card>
                <Card variant="gradient" gradientIndex={2} style={styles.cardDemo}>
                    <Text variant="body" weight="medium">Gradient 2</Text>
                </Card>
                <Card variant="gradient" gradientIndex={3} style={styles.cardDemo}>
                    <Text variant="body" weight="medium">Gradient 3</Text>
                </Card>
            </View>

            {/* ========================================== */}
            {/* SECTION 6: INPUTS */}
            {/* ========================================== */}
            <View style={styles.section}>
                <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
                    6. Inputs
                </Text>

                <Input
                    label="Default Input"
                    placeholder="Enter text..."
                    value={inputValue}
                    onChangeText={setInputValue}
                    containerStyle={styles.inputDemo}
                />

                <Input
                    label="Filled Variant"
                    placeholder="Enter text..."
                    variant="filled"
                    containerStyle={styles.inputDemo}
                />

                <Input
                    label="With Error"
                    placeholder="Enter text..."
                    error="Diese Eingabe ist ungültig"
                    containerStyle={styles.inputDemo}
                />

                <Input
                    label="With Hint"
                    placeholder="Enter text..."
                    hint="Mindestens 8 Zeichen"
                    containerStyle={styles.inputDemo}
                />
            </View>

            {/* ========================================== */}
            {/* SECTION 7: PROGRESS BARS */}
            {/* ========================================== */}
            <View style={styles.section}>
                <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
                    7. Progress Bars
                </Text>

                <Text variant="caption" color={theme.colors.textSecondary}>Gradient 1 - 75%</Text>
                <ProgressBar progress={75} gradientIndex={1} style={styles.progressDemo} />

                <Text variant="caption" color={theme.colors.textSecondary}>Gradient 2 - 50%</Text>
                <ProgressBar progress={50} gradientIndex={2} style={styles.progressDemo} />

                <Text variant="caption" color={theme.colors.textSecondary}>Gradient 3 - 25%</Text>
                <ProgressBar progress={25} gradientIndex={3} style={styles.progressDemo} />

                <Text variant="caption" color={theme.colors.textSecondary}>Without Gradient - 60%</Text>
                <ProgressBar progress={60} showGradient={false} style={styles.progressDemo} />

                <Text variant="caption" color={theme.colors.textSecondary}>Different Heights</Text>
                <ProgressBar progress={80} height={4} style={styles.progressDemo} />
                <ProgressBar progress={80} height={12} style={styles.progressDemo} />
                <ProgressBar progress={80} height={20} style={styles.progressDemo} />
            </View>

            {/* ========================================== */}
            {/* SECTION 8: SPACING & SHADOWS */}
            {/* ========================================== */}
            <View style={styles.section}>
                <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
                    8. Shadows
                </Text>

                <View style={styles.shadowRow}>
                    <View style={[styles.shadowBox, shadows.sm, { backgroundColor: theme.colors.surface }]}>
                        <Text variant="caption">SM</Text>
                    </View>
                    <View style={[styles.shadowBox, shadows.md, { backgroundColor: theme.colors.surface }]}>
                        <Text variant="caption">MD</Text>
                    </View>
                    <View style={[styles.shadowBox, shadows.lg, { backgroundColor: theme.colors.surface }]}>
                        <Text variant="caption">LG</Text>
                    </View>
                    <View style={[styles.shadowBox, shadows.xl, { backgroundColor: theme.colors.surface }]}>
                        <Text variant="caption">XL</Text>
                    </View>
                </View>
            </View>

            {/* ========================================== */}
            {/* SECTION 9: BORDER RADIUS */}
            {/* ========================================== */}
            <View style={styles.section}>
                <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
                    9. Border Radius
                </Text>

                <View style={styles.radiusRow}>
                    <View style={[styles.radiusBox, { backgroundColor: colors.primary[400], borderRadius: borderRadius.sm }]}>
                        <Text variant="caption" color="#FFF">sm</Text>
                    </View>
                    <View style={[styles.radiusBox, { backgroundColor: colors.primary[400], borderRadius: borderRadius.md }]}>
                        <Text variant="caption" color="#FFF">md</Text>
                    </View>
                    <View style={[styles.radiusBox, { backgroundColor: colors.primary[400], borderRadius: borderRadius.lg }]}>
                        <Text variant="caption" color="#FFF">lg</Text>
                    </View>
                    <View style={[styles.radiusBox, { backgroundColor: colors.primary[400], borderRadius: borderRadius.xl }]}>
                        <Text variant="caption" color="#FFF">xl</Text>
                    </View>
                    <View style={[styles.radiusBox, { backgroundColor: colors.primary[400], borderRadius: borderRadius['2xl'] }]}>
                        <Text variant="caption" color="#FFF">2xl</Text>
                    </View>
                </View>
            </View>

            <View style={{ height: spacing['3xl'] }} />
        </ScrollView>
    );
};

const DesignPreview: React.FC = () => {
    return (
        <ThemeProvider>
            <DesignPreviewContent />
        </ThemeProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.base,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
        paddingTop: spacing.xl,
    },
    themeSwitch: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    section: {
        marginBottom: spacing['2xl'],
    },
    sectionTitle: {
        marginBottom: spacing.md,
    },
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    colorSwatch: {
        width: (width - spacing.base * 2 - spacing.xs * 7) / 8,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
    },
    gradientRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    gradientItem: {
        flex: 1,
    },
    gradientBox: {
        height: 60,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    buttonColumn: {
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    cardDemo: {
        marginTop: spacing.sm,
    },
    inputDemo: {
        marginTop: spacing.sm,
    },
    progressDemo: {
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },
    shadowRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    shadowBox: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radiusRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    radiusBox: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DesignPreview;
