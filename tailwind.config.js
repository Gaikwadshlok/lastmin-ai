// import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			screens: {
				'xs': '475px',
			},
			spacing: {
				'24': '6rem',
				'26': '6.5rem',
			},
			colors: {
				border: 'hsl(var(--color-border))',
				input: 'hsl(var(--color-input))',
				ring: 'hsl(var(--color-ring))',
				background: 'hsl(var(--color-background))',
				foreground: 'hsl(var(--color-foreground))',
				primary: {
					DEFAULT: 'hsl(var(--color-primary))',
					foreground: 'hsl(var(--color-primary-foreground))',
					light: 'hsl(var(--color-primary-light))',
					lighter: 'hsl(var(--color-primary-lighter))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--color-secondary))',
					foreground: 'hsl(var(--color-secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--color-destructive))',
					foreground: 'hsl(var(--color-destructive-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--color-warning))',
					foreground: 'hsl(var(--color-warning-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--color-muted))',
					foreground: 'hsl(var(--color-muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--color-accent))',
					foreground: 'hsl(var(--color-accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--color-popover))',
					foreground: 'hsl(var(--color-popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--color-card))',
					foreground: 'hsl(var(--color-card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--color-sidebar-background))',
					foreground: 'hsl(var(--color-sidebar-foreground))',
					primary: 'hsl(var(--color-sidebar-primary))',
					'primary-foreground': 'hsl(var(--color-sidebar-primary-foreground))',
					accent: 'hsl(var(--color-sidebar-accent))',
					'accent-foreground': 'hsl(var(--color-sidebar-accent-foreground))',
					border: 'hsl(var(--color-sidebar-border))',
					ring: 'hsl(var(--color-sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-cosmic': 'var(--gradient-cosmic)'
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'card': 'var(--shadow-card)',
				'glow': 'var(--shadow-glow)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'fadeIn': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'fadeIn': 'fadeIn 0.6s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
