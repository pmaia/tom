Rails.application.routes.draw do
  resources :users, only: [:create, :update]

  get 'occupations' => 'occupations#index'

  get 'industries' => 'industries#index'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'home#index'
end
