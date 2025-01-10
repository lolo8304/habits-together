/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { CheckIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import {
  habitColorNames,
  habitCreationSchema,
  type HabitCreationT,
  type HabitT,
  useCreateHabit,
  useEditHabit,
} from '@/api';
import { HabitIcon, habitIcons } from '@/components/habit-icon';
import {
  Button,
  colors,
  ControlledInput,
  Modal,
  Pressable,
  ScreenContainer,
  ScrollView,
  Switch,
  Text,
  useModal,
  View,
} from '@/ui';
import { Header } from '@/ui/header';

/**
 * This is for editing or creating a habit. Pass in query params.
 *
 * - ex. /habits/edit-habit?mode=edit&id=n3i2e0ddj32i
 * - ex. /habits/edit-habit?mode=create&id=dummyid
 */
export default function EditHabit() {
  const { colorScheme } = useColorScheme();
  const iconModal = useModal();

  const { mode, habit: habitJson } = useLocalSearchParams<{
    mode: 'edit' | 'create';
    habit: string;
  }>();

  const parsedHabit: HabitT = mode === 'edit' ? JSON.parse(habitJson) : null;
  const createHabit = useCreateHabit();
  const updateHabit = useEditHabit();

  const { control, handleSubmit, setValue, watch } = useForm<HabitCreationT>({
    resolver: zodResolver(habitCreationSchema),
    defaultValues: {
      icon: (mode === 'edit'
        ? parsedHabit.icon
        : 'diamond') as keyof typeof habitIcons,
      title: mode === 'edit' ? parsedHabit.title : '',
      description: mode === 'edit' ? parsedHabit.description : '',
      colorName: mode === 'edit' ? parsedHabit.colorName : 'red',
      allowMultipleCompletions:
        mode === 'edit' ? parsedHabit.settings.allowMultipleCompletions : false,
    },
  });

  const selectedColor = watch('colorName');
  const selectedIcon = watch('icon');
  const allowMultipleCompletions = watch('allowMultipleCompletions');

  const onSubmit = (data: HabitCreationT) => {
    if (mode === 'edit') {
      updateHabit.mutate({
        habitId: parsedHabit.id,
        newHabitInfo: data,
      });
    } else {
      createHabit.mutate({
        habitCreationInfo: data,
      });
    }
    router.back();
  };

  return (
    <ScreenContainer>
      <Header
        leftButton={'cancel'}
        title={mode === 'create' ? 'New Habit' : 'Edit Habit'}
      />
      <ScrollView>
        <View className="flex flex-col gap-4">
          <View className="flex flex-col gap-2">
            <Text className="">Icon</Text>
            <View className="flex-row items-center justify-center gap-2">
              <Pressable
                className="h-12 w-12 rounded-lg border border-slate-200 bg-white p-2 dark:border-stone-700 dark:bg-transparent dark:text-white"
                onPress={iconModal.present}
              >
                <HabitIcon
                  icon={selectedIcon}
                  size={24}
                  color={colorScheme === 'dark' ? colors.white : colors.black}
                />
              </Pressable>
              <Button
                variant="outline"
                className="flex-1"
                label="Select Icon"
                onPress={iconModal.present}
              />
            </View>
          </View>
          <View className="flex flex-col gap-2">
            <Text className="">Title</Text>
            <ControlledInput
              control={control}
              name="title"
              placeholder="Enter title"
            />
          </View>
          <View className="flex flex-col gap-2">
            <Text className="">Description</Text>
            <ControlledInput
              control={control}
              name="description"
              placeholder="Enter description"
              multiline
              style={{ height: 80 }}
            />
          </View>
          <View className="flex h-40 flex-col gap-2">
            <Text className="">Color</Text>
            <View className="flex max-w-full flex-1 flex-wrap">
              {habitColorNames.map((col) => (
                <Pressable
                  className="aspect-square p-1"
                  key={col}
                  style={{
                    width: '11.1%',
                  }}
                  onPress={() => setValue('colorName', col)}
                >
                  <View
                    className="flex h-full w-full items-center justify-center rounded-full"
                    style={{
                      backgroundColor:
                        col === 'stone'
                          ? colors.stone[400]
                          : colors.habitColors[col]?.base,
                    }}
                  >
                    {col === selectedColor ? (
                      <CheckIcon size={24} color="white" />
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
          <View className="flex flex-col gap-2">
            <Text className="">More Settings</Text>
            <View className="flex-row items-center justify-center">
              <Switch.Root
                checked={allowMultipleCompletions}
                onChange={(value) =>
                  setValue('allowMultipleCompletions', value)
                }
                accessibilityLabel="Allow multiple completions per day"
                className="flex w-full flex-row justify-between"
              >
                <Switch.Label text="Allow multiple completions per day" />
                <Switch.Icon checked={allowMultipleCompletions} />
              </Switch.Root>
            </View>
          </View>
          <Button
            label={mode === 'edit' ? 'Save Changes' : 'Create Habit'}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </ScrollView>

      <Modal
        ref={iconModal.ref}
        snapPoints={['80%']}
        backgroundStyle={{
          backgroundColor:
            colorScheme === 'dark' ? colors.neutral[800] : colors.white,
        }}
      >
        <View className="flex flex-1 px-4">
          <ScrollView>
            <View className="flex-row flex-wrap justify-center gap-4 py-4">
              {Object.keys(habitIcons).map((icon) => (
                <Pressable
                  key={icon}
                  className="h-16 w-16 items-center justify-center rounded-lg border border-slate-200 dark:border-stone-700"
                  onPress={() => {
                    setValue('icon', icon as keyof typeof habitIcons);
                    iconModal.dismiss();
                  }}
                >
                  <HabitIcon
                    icon={icon as keyof typeof habitIcons}
                    size={24}
                    color={colorScheme === 'dark' ? colors.white : colors.black}
                  />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
