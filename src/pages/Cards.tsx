import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ExternalLink, CreditCard, Globe, Plane, Landmark, Shield, Cpu, Gem, Zap, Briefcase, Trash2, Star, Edit2, Euro, MoreVertical } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { CardPartner, UserCard } from '../types'
import { cn } from '../lib/utils'

// Icon mapping
const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Globe, CreditCard, Plane, Landmark, Shield, Cpu, Gem, Zap, Briefcase, Euro, Plus
  }
  return icons[iconName] || CreditCard
}

export default function Cards() {
  const { t } = useTranslation()
  const { cardPartners, userCards, addUserCard, removeUserCard, toggleCardFavorite, updateUserCard } = useAppStore()
  
  const [selectedPartner, setSelectedPartner] = useState<CardPartner | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Add/Edit Form State
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [newCardName, setNewCardName] = useState('')
  const [newCardProvider, setNewCardProvider] = useState('')
  const [newCardTag, setNewCardTag] = useState('')
  const [newCardStatus, setNewCardStatus] = useState<'pending' | 'active' | 'rejected'>('active')

  // Sort user cards: Favorites first, then by creation
  const sortedUserCards = [...userCards].sort((a, b) => {
    if (a.favorite === b.favorite) return b.createdAt - a.createdAt
    return a.favorite ? -1 : 1
  })

  const handlePartnerClick = (partner: CardPartner) => {
    if (partner.id === 'other') {
      // "Other" opens Add Card modal directly
      openAddModal()
    } else {
      // Others open Disclaimer -> Apply
      setSelectedPartner(partner)
      setShowDisclaimer(true)
    }
  }

  const handleApplyContinue = () => {
    if (selectedPartner) {
      window.open(selectedPartner.link, '_blank')
      setShowDisclaimer(false)
      setSelectedPartner(null)
    }
  }

  const openAddModal = (card?: UserCard) => {
    if (card) {
      setEditingCardId(card.id)
      setNewCardName(card.name)
      setNewCardProvider(card.providerName)
      setNewCardTag(card.tags[0] || '')
      setNewCardStatus(card.status || 'active')
    } else {
      setEditingCardId(null)
      setNewCardName('')
      setNewCardProvider('')
      setNewCardTag('')
      setNewCardStatus('active')
    }
    setShowAddModal(true)
  }

  const handleSaveCard = () => {
    if (!newCardName || !newCardProvider) return
    
    // Find partner to get URL (if known provider)
    const partner = cardPartners.find(p => p.name === newCardProvider)
    const url = partner?.link || ''

    if (editingCardId) {
      updateUserCard(editingCardId, {
        name: newCardName,
        providerName: newCardProvider,
        tags: newCardTag ? [newCardTag] : [],
        url: url,
        status: newCardStatus
      })
    } else {
      addUserCard({
        partnerId: partner?.id || 'custom',
        name: newCardName,
        providerName: newCardProvider,
        tags: newCardTag ? [newCardTag] : [],
        url: url,
        status: newCardStatus
      })
    }
    
    setShowAddModal(false)
  }

  const handleOpenCard = (card: UserCard) => {
    if (card.url) {
      window.open(card.url, '_blank')
    } else {
      if (window.confirm(t('cards.noUrlWarning', 'No URL found. Do you want to edit this card to add a link?'))) {
          openAddModal(card)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background-primary/95 backdrop-blur-md border-b border-divider px-4 py-4">
        <h1 className="text-xl font-bold">{t('cards.title')}</h1>
      </div>

      <div className="p-4 space-y-8">
        {/* Section 1: Card Partners (9-Grid) */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{t('cards.partners', 'Card Partners')}</h2>
            <span className="text-[10px] text-accent font-medium bg-accent/10 px-2 py-1 rounded-full">
              {t('cards.recommendedGuide')}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {cardPartners.map((partner, index) => {
              const Icon = getIcon(partner.icon)
              const isRecommended = index < 3 // Top 3 are recommended
              
              return (
                <button
                  key={partner.id}
                  onClick={() => handlePartnerClick(partner)}
                  className={cn(
                    "flex flex-col items-center justify-between p-3 bg-background-secondary border rounded-xl transition-all text-center h-[120px] relative overflow-hidden",
                    isRecommended ? "border-accent/40 bg-background-secondary/80" : "border-divider hover:border-accent/50 hover:bg-background-tertiary"
                  )}
                >
                  {isRecommended && (
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-accent/20 to-transparent rounded-bl-full -mr-2 -mt-2" />
                  )}
                  
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center mb-2 text-white shadow-sm relative z-10"
                    style={{ backgroundColor: partner.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 flex flex-col justify-center w-full z-10">
                    <h3 className="font-medium text-xs truncate w-full">{partner.name}</h3>
                    <p className={cn(
                      "text-[9px] truncate w-full mt-0.5",
                      isRecommended ? "text-accent font-medium" : "text-text-secondary opacity-70"
                    )}>
                      {partner.tags.map(tag => t(`cards.partnerTags.${tag}`, tag)).join(', ')}
                    </p>
                  </div>
                  <div className="mt-2 w-full z-10">
                    <span className={cn(
                      "block w-full py-1 rounded text-[10px] font-medium transition-colors",
                      isRecommended ? "bg-accent text-background-primary" : "bg-background-tertiary text-accent"
                    )}>
                      {t('cards.apply')}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Section 2: My Cards */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{t('cards.myCards', 'My Cards')}</h2>
            <button
              onClick={() => openAddModal()}
              className="flex items-center gap-1 text-xs font-bold text-accent hover:text-accent/80 transition-colors px-3 py-1.5 rounded-lg bg-accent/5 hover:bg-accent/10"
            >
              <Plus size={14} strokeWidth={3} />
              {t('cards.addCard', 'Add Card')}
            </button>
          </div>

          <div className="space-y-3">
            {sortedUserCards.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-divider rounded-xl text-text-muted text-sm">
                {t('cards.noCards', 'No cards added yet')}
              </div>
            ) : (
              sortedUserCards.map((card) => {
                // Try to find partner color/icon
                const partner = cardPartners.find(p => p.name === card.providerName)
                const Icon = partner ? getIcon(partner.icon) : CreditCard
                const color = partner ? partner.color : '#555'

                return (
                  <div 
                    key={card.id}
                    className="group bg-background-secondary border border-divider rounded-xl p-4 flex items-center gap-4 hover:border-accent/30 transition-all"
                  >
                    {/* Left: Icon */}
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <Icon size={20} />
                    </div>

                    {/* Middle: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm truncate">{card.name}</h3>
                        {card.favorite && <Star size={10} className="fill-accent text-accent" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span className="truncate">{card.providerName}</span>
                        {card.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 bg-background-tertiary rounded text-[10px]">
                              {card.tags[0]}
                            </span>
                          </>
                        )}
                        {card.status && (
                          <>
                            <span>•</span>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] capitalize",
                              card.status === 'active' ? "text-status-success bg-status-success/10" :
                              card.status === 'pending' ? "text-status-warning bg-status-warning/10" :
                              "text-status-error bg-status-error/10"
                            )}>
                              {card.status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenCard(card)}
                        className="px-4 py-2 bg-accent text-background-primary font-bold rounded-lg text-xs hover:bg-accent/90 transition-colors"
                      >
                        {t('cards.open')}
                      </button>
                      
                      {/* Context Menu (Simplified as row buttons for mobile ease) */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                         <button 
                          onClick={() => toggleCardFavorite(card.id)}
                          className={cn("p-1.5 rounded-lg hover:bg-background-tertiary", card.favorite ? "text-accent" : "text-text-muted")}
                        >
                          <Star size={14} className={cn(card.favorite && "fill-accent")} />
                        </button>
                        <button 
                          onClick={() => openAddModal(card)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-background-tertiary"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => {
                              if (window.confirm(t('cards.confirmDelete', 'Are you sure you want to delete this card?'))) {
                                  removeUserCard(card.id)
                              }
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-background-tertiary"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Footer Disclaimer */}
        <div className="pt-8 pb-4 px-4 text-center">
          <p className="text-[10px] text-text-muted leading-relaxed max-w-xs mx-auto">
            {t('cards.footer')}
          </p>
        </div>
      </div>

      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisclaimer(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-background-secondary rounded-t-3xl sm:rounded-3xl p-6 border-t border-divider sm:border sm:m-4"
            >
              <div className="flex flex-col items-center text-center">
                <h3 className="text-lg font-bold mb-2">{t('cards.disclaimerTitle')}</h3>
                
                <p className="text-sm text-text-secondary mb-8 leading-relaxed px-4">
                  {t('cards.disclaimerText')}
                </p>

                <div className="w-full space-y-3">
                  <button
                    onClick={handleApplyContinue}
                    className="w-full py-3.5 bg-accent text-background-primary font-bold rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {t('cards.disclaimerConfirm')}
                    <ExternalLink size={18} />
                  </button>
                  <button
                    onClick={() => setShowDisclaimer(false)}
                    className="w-full py-3.5 text-text-secondary font-medium hover:text-text-primary transition-colors"
                  >
                    {t('cards.cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Card Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-background-secondary rounded-t-3xl sm:rounded-3xl p-6 border-t border-divider sm:border sm:m-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">{t('cards.addCardTitle')}</h3>
                <button onClick={() => setShowAddModal(false)} className="text-text-secondary hover:text-text-primary">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-secondary font-medium mb-1.5 block">{t('cards.cardName')} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)}
                    placeholder="e.g. Wise Personal"
                    className="w-full bg-background-tertiary border border-divider rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-text-secondary font-medium mb-1.5 block">{t('cards.provider')}</label>
                  <select
                    value={newCardProvider}
                    onChange={(e) => setNewCardProvider(e.target.value)}
                    className="w-full bg-background-tertiary border border-divider rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-colors appearance-none"
                  >
                    <option value="" disabled>{t('cards.selectProvider', 'Select Provider')}</option>
                    {cardPartners.filter(p => p.id !== 'other').map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                    <option value="Other">{t('cards.other', 'Other')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-text-secondary font-medium mb-1.5 block">{t('cards.tag')}</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['daily', 'online', 'sub', 'backup'].map(tagKey => {
                       const tagLabel = t(`cards.tags.${tagKey}`)
                       return (
                        <button
                          key={tagKey}
                          onClick={() => setNewCardTag(tagLabel)}
                          className={cn(
                            "px-2 py-1 text-[10px] rounded-lg border transition-all",
                            newCardTag === tagLabel 
                              ? "bg-accent/20 border-accent text-accent" 
                              : "bg-background-tertiary border-transparent text-text-secondary"
                          )}
                        >
                          {tagLabel}
                        </button>
                       )
                    })}
                  </div>
                  <input
                    type="text"
                    value={newCardTag}
                    onChange={(e) => setNewCardTag(e.target.value)}
                    placeholder={t('cards.customTag', 'Custom Tag')}
                    className="w-full bg-background-tertiary border border-divider rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-text-secondary font-medium mb-1.5 block">{t('cards.status', 'Status')}</label>
                  <div className="flex gap-2">
                    {['active', 'pending', 'rejected'].map(status => (
                      <button
                        key={status}
                        onClick={() => setNewCardStatus(status as any)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-lg border transition-all capitalize",
                          newCardStatus === status 
                            ? "bg-accent/20 border-accent text-accent" 
                            : "bg-background-tertiary border-transparent text-text-secondary"
                        )}
                      >
                        {t(`cards.statusTypes.${status}`, status)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveCard}
                  disabled={!newCardName || !newCardProvider}
                  className="w-full mt-4 py-3.5 bg-accent text-background-primary font-bold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingCardId ? t('common.confirm') : t('cards.addCard')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
