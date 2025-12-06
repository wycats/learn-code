import type { Book } from './schema';

export const THE_FIELD_GUIDE: Book = {
	chapters: [
		{
			id: 'basics',
			title: 'Survival Basics',
			pages: [
				{
					id: 'movement',
					title: 'Moving Forward',
					content: [
						{
							type: 'text',
							voice: 'guide',
							content:
								'The **Step** block moves the character one tile forward in the direction they are facing. If the path is blocked by a wall or hazard, the character will not move (or may suffer consequences).'
						},
						{
							type: 'text',
							voice: 'zoey',
							content:
								"Watch where you're going! I bumped my head on so many walls before I figured this out."
						},
						{
							type: 'playground',
							caption: 'Try moving to the goal.',
							snippet: {
								gridSize: { width: 3, height: 3 },
								layout: {
									'0,1': 'grass',
									'1,1': 'grass',
									'2,1': 'goal'
								},
								start: { x: 0, y: 1 },
								startOrientation: 'E',
								availableBlocks: ['move-forward']
							}
						}
					]
				},
				{
					id: 'turning',
					title: 'Turning',
					content: [
						{
							type: 'text',
							voice: 'guide',
							content:
								"The **Turn Left** and **Turn Right** blocks rotate the character 90 degrees in place. They do not change the character's position on the grid."
						},
						{
							type: 'text',
							voice: 'jonas',
							content:
								"Remember: Rotation is relative to the character's current facing. 'Left' is *their* left."
						},
						{
							type: 'playground',
							caption: 'Turn and move.',
							snippet: {
								gridSize: { width: 3, height: 3 },
								layout: {
									'1,2': 'grass',
									'1,1': 'grass',
									'2,1': 'goal'
								},
								start: { x: 1, y: 2 },
								startOrientation: 'N',
								availableBlocks: ['move-forward', 'turn-right']
							}
						}
					]
				}
			]
		},
		{
			id: 'automation',
			title: 'Automation',
			unlockedBy: 'level-6-complete', // Assuming loops are introduced around here
			pages: [
				{
					id: 'loops',
					title: 'The Loop',
					content: [
						{
							type: 'text',
							voice: 'guide',
							content:
								'The **Repeat** block executes the sequence of blocks inside it a specific number of times.'
						},
						{
							type: 'text',
							voice: 'zoey',
							content: "It's like magic! I write it once, and it happens five times!"
						},
						{
							type: 'text',
							voice: 'jonas',
							content: 'Efficiency is key. Why write 5 blocks when 1 wrapper will do?'
						}
					]
				}
			]
		}
	]
};
