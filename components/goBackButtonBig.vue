<template>
    <div ref="detailPageBackArrow" class="detailPage__arrowBack" @click="goBackArrowClicked()">
        <img src="~/assets/icons/arrow.svg" />
    </div>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const { popFromStack } = useIonicRouter();

const props = defineProps({
    backLocation: {
        type: String,
        default: null,
        required: false,
    },
});

const goBackArrowClicked = () => {
    Haptics.impact({ style: ImpactStyle.Medium });
    if (props.backLocation) {
        popFromStack(props.backLocation);
    } else {
        popFromStack();
    }
};
</script>
