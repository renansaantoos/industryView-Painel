import { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/common/PageHeader';
import { Check, Zap, Shield, Star } from 'lucide-react';

interface PricePlan {
  key: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  icon: React.ReactNode;
}

export default function Pricing() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: PricePlan[] = [
    {
      key: 'free',
      name: t('pricing.free'),
      price: 'R$ 0',
      period: t('pricing.perMonth'),
      features: [
        t('pricing.feature1Project'),
        t('pricing.feature5Users'),
        t('pricing.featureBasicReports'),
      ],
      highlighted: false,
      icon: <Zap size={24} />,
    },
    {
      key: 'pro',
      name: t('pricing.pro'),
      price: 'R$ 99',
      period: t('pricing.perMonth'),
      features: [
        t('pricing.featureUnlimitedProjects'),
        t('pricing.feature50Users'),
        t('pricing.featureAdvancedReports'),
        t('pricing.featureTrackerMap'),
        t('pricing.featureInventory'),
        t('pricing.featureSupport'),
      ],
      highlighted: true,
      icon: <Star size={24} />,
    },
    {
      key: 'enterprise',
      name: t('pricing.enterprise'),
      price: t('pricing.custom'),
      period: '',
      features: [
        t('pricing.featureEverythingPro'),
        t('pricing.featureUnlimitedUsers'),
        t('pricing.featureCustomIntegrations'),
        t('pricing.featureDedicatedSupport'),
        t('pricing.featureSLA'),
      ],
      highlighted: false,
      icon: <Shield size={24} />,
    },
  ];

  const handleSelectPlan = async (planKey: string) => {
    setSelectedPlan(planKey);
    setLoading(true);
    try {
      // In a real implementation, this would call the Stripe API to create a checkout session
      // const session = await stripeApi.createCheckoutSession({ plan: planKey });
      // window.location.href = session.url;
      console.log('Selected plan:', planKey);
    } catch (err) {
      console.error('Failed to start checkout:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('pricing.title')}
        subtitle={t('pricing.subtitle')}
      />

      <motion.div
        variants={staggerParent}
        initial="initial"
        animate="animate"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '1000px',
        }}
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.key}
            variants={fadeUpChild}
            className="card"
            style={{
              padding: '32px 24px',
              border: plan.highlighted ? '2px solid var(--color-primary)' : '1px solid var(--color-alternate)',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            {plan.highlighted && (
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {t('pricing.popular')}
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '12px',
                  backgroundColor: plan.highlighted ? 'var(--color-primary)' : 'var(--color-tertiary-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: plan.highlighted ? 'white' : 'var(--color-primary)',
                }}
              >
                {plan.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>{plan.name}</h3>
              <div>
                <span style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-primary-text)' }}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span style={{ fontSize: '14px', color: 'var(--color-secondary-text)' }}>
                    /{plan.period}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {plan.features.map((feature, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: 'var(--color-secondary-text)' }}>{feature}</span>
                </div>
              ))}
            </div>

            <button
              className={`btn ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSelectPlan(plan.key)}
              disabled={loading && selectedPlan === plan.key}
              style={{ width: '100%' }}
            >
              {loading && selectedPlan === plan.key ? (
                <span className="spinner" />
              ) : plan.key === 'enterprise' ? (
                t('pricing.contactSales')
              ) : (
                t('pricing.selectPlan')
              )}
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
