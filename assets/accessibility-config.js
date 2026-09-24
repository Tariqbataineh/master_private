
"use strict";

window.WusoolAccessibilityConfig = (() => {
    const KEY =
        "wusoolAccessibilityRequirements";

    const defaults = [
        {
            id: "accessibleEntrance",
            key: "accessibleEntrance",
            title: "Accessible Entrance",
            description: "Step-free main entrance for visitors.",
            icon: "bi-door-open",
            category: "Entrance",
            weight: 8,
            required: true,
            enabled: true
        },
        {
            id: "entranceRamp",
            key: "entranceRamp",
            title: "Entrance Ramp",
            description: "Ramp with safe slope and handrails.",
            icon: "bi-signpost-split",
            category: "Entrance",
            weight: 8,
            required: false,
            enabled: true
        },
        {
            id: "accessibleParking",
            key: "accessibleParking",
            title: "Accessible Parking",
            description: "Reserved parking near the entrance.",
            icon: "bi-p-square",
            category: "Parking",
            weight: 6,
            required: false,
            enabled: true
        },
        {
            id: "elevator",
            key: "elevator",
            title: "Elevator",
            description: "Accessible elevator for upper floors.",
            icon: "bi-arrow-down-up",
            category: "Interior",
            weight: 7,
            required: false,
            enabled: true
        },
        {
            id: "accessibleRestroom",
            key: "accessibleRestroom",
            title: "Accessible Restroom",
            description: "Restroom designed for wheelchair users.",
            icon: "bi-person-wheelchair",
            category: "Restroom",
            weight: 7,
            required: false,
            enabled: true
        },
        {
            id: "widePathways",
            key: "widePathways",
            title: "Wide Pathways",
            description: "Clear internal paths with enough width.",
            icon: "bi-arrows-expand",
            category: "Interior",
            weight: 5,
            required: false,
            enabled: true
        },
        {
            id: "automaticDoors",
            key: "automaticDoors",
            title: "Automatic Doors",
            description: "Automatic or easy-to-open doors.",
            icon: "bi-door-closed",
            category: "Entrance",
            weight: 5,
            required: false,
            enabled: true
        },
        {
            id: "tactilePaving",
            key: "tactilePaving",
            title: "Tactile Paving",
            description: "Tactile guidance for visually impaired visitors.",
            icon: "bi-grid-3x3-gap",
            category: "Navigation",
            weight: 5,
            required: false,
            enabled: true
        },
        {
            id: "brailleSigns",
            key: "brailleSigns",
            title: "Braille Signs",
            description: "Important signs include Braille information.",
            icon: "bi-badge-3d",
            category: "Navigation",
            weight: 4,
            required: false,
            enabled: true
        },
        {
            id: "hearingSupport",
            key: "hearingSupport",
            title: "Hearing Support",
            description: "Visual alerts or hearing assistance available.",
            icon: "bi-ear",
            category: "Service",
            weight: 4,
            required: false,
            enabled: true
        },
        {
            id: "wheelchairAvailable",
            key: "wheelchairAvailable",
            title: "Wheelchair Available",
            description: "A wheelchair can be requested at the branch.",
            icon: "bi-person-wheelchair",
            category: "Service",
            weight: 4,
            required: false,
            enabled: true
        },
        {
            id: "staffAssistance",
            key: "staffAssistance",
            title: "Staff Assistance",
            description: "Staff members can provide accessibility support.",
            icon: "bi-people",
            category: "Service",
            weight: 4,
            required: false,
            enabled: true
        }
    ];

    const read = () => {
        try {
            const saved =
                JSON.parse(
                    localStorage.getItem(
                        KEY
                    ) || "null"
                );

            if (
                Array.isArray(saved) &&
                saved.length
            ) {
                return saved;
            }
        } catch {
            // Use defaults.
        }

        return structuredClone(
            defaults
        );
    };

    const getRequirements = () => {
        return read()
            .filter(
                (item) =>
                    item.enabled !==
                    false
            )
            .map(
                (item) => ({
                    ...item,
                    key:
                        item.key ||
                        item.id
                })
            );
    };

    const calculateWeightedScore = (
        accessibilityData = {}
    ) => {
        const requirements =
            getRequirements();

        let earned = 0;
        let possible = 0;

        requirements
            .forEach(
                (requirement) => {
                    const weight =
                        Number(
                            requirement.weight ||
                            1
                        );

                    possible +=
                        weight;

                    if (
                        accessibilityData[
                            requirement.key
                        ] ===
                        "available"
                    ) {
                        earned +=
                            weight;
                    }
                }
            );

        return possible
            ? Math.round(
                earned /
                possible *
                100
            )
            : 0;
    };

    return {
        KEY,
        defaults,
        getRequirements,
        calculateWeightedScore
    };
})();
